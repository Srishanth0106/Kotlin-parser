const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchHealth() {
    try {
        const res = await fetch(`${API_BASE}/health`);
        return await res.json();
    } catch (err) {
        return { status: 'offline', parserAvailable: false, error: err.message };
    }
}

export async function fetchExamples() {
    try {
        const res = await fetch(`${API_BASE}/examples`);
        return await res.json();
    } catch (err) {
        console.error('Failed to fetch examples:', err);
        return [];
    }
}

export async function parseCode(code) {
    const res = await fetch(`${API_BASE}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });
    return await res.json();
}
