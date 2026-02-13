const API_URL = 'http://localhost:8080/api';
let authToken = localStorage.getItem('token');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showDashboard();
    } else {
        showAuth();
    }
    
    setupEventListeners();
});

function setupEventListeners() {
    // Auth forms
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Health form
    document.getElementById('health-form').addEventListener('submit', handleAssessment);
}

// Navigation
function showTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    
    event.target.classList.add('active');
    document.getElementById(`${tab}-form`).classList.remove('hidden');
}

function showAuth() {
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('dashboard-screen').classList.remove('active');
}

function showDashboard() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
    loadHistory();
}

// Auth handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('token', authToken);
            showDashboard();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        alert('Network error. Is the backend running?');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('token', authToken);
            showDashboard();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        alert('Network error');
    }
}

function logout() {
    localStorage.removeItem('token');
    authToken = null;
    showAuth();
}

// Health Assessment
async function handleAssessment(e) {
    e.preventDefault();
    
    const data = {
        age: parseInt(document.getElementById('age').value),
        weightKg: parseFloat(document.getElementById('weight').value),
        heightCm: parseFloat(document.getElementById('height').value),
        systolicBp: parseInt(document.getElementById('systolic').value),
        diastolicBp: parseInt(document.getElementById('diastolic').value),
        glucoseLevel: parseFloat(document.getElementById('glucose').value),
        smokingStatus: document.getElementById('smoking').value,
        exerciseFrequency: document.getElementById('exercise').value
    };
    
    try {
        const response = await fetch(`${API_URL}/health/assess`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        const result = await response.json();
        displayResults(result);
        loadHistory();
    } catch (error) {
        alert('Failed to calculate risk');
    }
}

function displayResults(result) {
    const card = document.getElementById('results-card');
    card.classList.remove('hidden');
    
    // Animate score
    const scoreEl = document.getElementById('risk-score');
    const circle = document.getElementById('risk-circle');
    const levelEl = document.getElementById('risk-level');
    
    // Set color based on risk
    const colors = {
        'LOW': '#22c55e',
        'MODERATE': '#eab308',
        'HIGH': '#f97316',
        'CRITICAL': '#ef4444'
    };
    
    circle.style.borderColor = result.riskColor;
    scoreEl.textContent = result.riskScore;
    levelEl.textContent = `${result.riskLevel} RISK`;
    levelEl.style.color = result.riskColor;
    
    // BMI
    document.getElementById('bmi-value').textContent = result.bmi;
    document.getElementById('bmi-category').textContent = result.bmiCategory;
    
    // Recommendations
    const recList = document.getElementById('recommendations-list');
    recList.innerHTML = result.recommendations.map(rec => 
        `<li>${rec}</li>`
    ).join('');
    
    // Scroll to results
    card.scrollIntoView({ behavior: 'smooth' });
}

// History
async function loadHistory() {
    try {
        const response = await fetch(`${API_URL}/health/history`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!response.ok) return;
        
        const history = await response.json();
        const container = document.getElementById('history-list');
        
        if (history.length === 0) {
            container.innerHTML = '<p class="empty-state">No assessments yet</p>';
            return;
        }
        
        container.innerHTML = history.map(item => `
            <div class="history-item">
                <div>
                    <div class="history-date">${new Date(item.createdAt).toLocaleDateString()}</div>
                    <div>BMI: ${item.bmi || 'N/A'}</div>
                </div>
                <div class="history-risk">
                    <span>Score: ${item.riskScore}</span>
                    <span class="risk-badge ${item.riskLevel.toLowerCase()}">${item.riskLevel}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load history');
    }
}