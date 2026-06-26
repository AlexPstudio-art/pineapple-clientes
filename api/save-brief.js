// api/save-brief.js
module.exports = async function handler(req, res) {
  console.log('METHOD:', req.method);
  console.log('BODY TYPE:', typeof req.body);
  console.log('BODY:', JSON.stringify(req.body));

  if (req.method !== 'POST') {
    console.log('REJECTED: not POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  const { nombre, empresa, email, telefono, servicio, notas } = body;

  const nombreCliente = empresa || nombre || 'cliente';
  const slug = nombreCliente.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filePath = `clientes/${slug}/brief-${timestamp}.md`;

  const servicioMap = {
    branding: 'Branding',
    web: 'Web',
    marketing: 'Marketing',
    contenido: 'Contenido',
    investigacion: 'Investigación',
  };

  const mdContent = [
    `# Brief — ${nombreCliente}`,
    '',
    `**Servicio:** ${servicioMap[servicio] || servicio || '—'}`,
    `**Fecha:** ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    `**Email:** ${email || '—'}`,
    `**Teléfono:** ${telefono || '—'}`,
    '',
    '---',
    '',
    notas || '(sin notas)',
  ].join('\n');

  const contentBase64 = Buffer.from(mdContent, 'utf-8').toString('base64');

  console.log('Calling GitHub API for path:', filePath);

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
    console.error('GitHub error:', JSON.stringify(err));
    return res.status(500).json({ error: 'Error guardando en GitHub', detail: err });
  }

  const data = await githubRes.json();
  return res.status(200).json({
    success: true,
    html_url: data.content.html_url,
    path: filePath,
  });
};
