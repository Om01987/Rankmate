const API_URL = process.env.REACT_APP_API_URL;

export async function fetchRrb(url) {
  const res = await fetch(`${API_URL}/fetch-rrb`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return res.json(); // or res.text(), depending on your endpoint
}
