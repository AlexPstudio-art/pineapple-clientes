// api/save-brief.js
// Vercel serverless function
// Recibe: { nombre, empresa, email, telefono, servicio, notas } desde Make
// Crea: clientes/[slug]/brief-[timestamp].md en el repo de GitHub

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nombre, empresa, email, telefono, servicio, notas } = req.body;

  if (!notas) {
    return res.status(400).json({ error: 'Faltan datos del brief' });
  }

  // Construir slug y nombre del archivo
  const nombreCliente = empresa || nombre || 'cliente';
  const slug = nombreCliente.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filePath = `clientes/${slug}/brief-${timestamp}.md`;

  // Mapeo de servicio
  const servicioMap = {
    branding: 'Branding',
    web: 'Web',
    marketing: 'Marketing',
    contenido: 'Contenido',
    investigacion: 'Investigación',
  };

  // Contenido del archivo .md
  const mdContent = [
    `# Brief — ${nombreCliente}`,
    '',
    `**Servicio:** ${servicioMap[servicio] || servicio}`,
    `**Fecha:** ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    `**Email:** ${email || '—'}`,
    `**Teléfono:** ${telefono || '—'}`,
    '',
    '---',
    '',
    notas,
  ].join('\n');

  // Encode a base64 para la API de GitHub
  const contentBase64 = Buffer.from(mdContent, 'utf-8').toString('base64');

  // Llamada a GitHub API
  const githubRes = await fetch(
    `https://api.github.com/repos/AlexPstudio-art/pineapple-clientes/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Brief de ${nombreCliente}`,
        content: contentBase64,
        branch: 'main',
      }),
    }
  );

  if (!githubRes.ok) {
    const err = await githubRes.json();
    console.error('GitHub error:', err);
    return res.status(500).json({ error: 'Error guardando en GitHub', detail: err });
  }

  const data = await githubRes.json();
  return res.status(200).json({
    success: true,
    html_url: data.content.html_url,
    path: filePath,
  });
}
