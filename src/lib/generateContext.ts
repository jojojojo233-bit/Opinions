export async function generateContext(poll: {
  question: string;
  category?: string;
  options?: string[];
}) {
  const base = import.meta.env.VITE_API_URL || '';
  const resp = await fetch(`${base}/api/generate-context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(poll),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Failed to generate context: ${resp.status} ${txt}`);
  }

  const data = await resp.json();
  return data.context as string;
}

export default generateContext;
