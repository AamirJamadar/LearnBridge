document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard();
});

async function loadLeaderboard() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/leaderboard');
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const data = await response.json();
        
        renderLeaderboard(data);
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

function renderLeaderboard(data) {
    const topThreeContainer = document.getElementById('topThreeContainer');
    const tableBody = document.getElementById('leaderboardTableBody');
    
    if (!topThreeContainer || !tableBody) return;
    
    topThreeContainer.innerHTML = '';
    tableBody.innerHTML = '';
    
    const medals = ['gold', 'silver', 'bronze'];
    const icons = ['fa-crown', 'fa-medal', 'fa-award'];
    
    // Top 3
    for (let i = 0; i < Math.min(3, data.length); i++) {
        const user = data[i];
        const cardHTML = `
            <div class="card leaderboard-card" style="opacity: 0; transform: translateY(20px); animation: fadeIn 0.5s ease forwards ${i * 0.1}s;">
                <div class="leaderboard-header">
                    <div class="rank-badge ${medals[i]}">
                        <i class="fas ${icons[i]}"></i>
                    </div>
                    <img src="${user.avatar || 'https://via.placeholder.com/80'}" alt="${user.username}" class="leaderboard-avatar">
                    <h3>${user.username}</h3>
                    <p class="points">${user.points} points</p>
                </div>
            </div>
        `;
        topThreeContainer.innerHTML += cardHTML;
    }
    
    // Rest of the table (All users for completeness, or just from rank 4 down)
    for (let i = 0; i < data.length; i++) {
        const user = data[i];
        
        // Include everyone in the table, or skip top 3? Let's include everyone so 'You' can see your rank even if 1st
        // Or if we strictly follow prior UI, we could skip the top 3 in the table list if they are in the cards grid?
        // Let's just output everyone for the table to have a complete list
        let levelBadge = `<span style="background: var(--primary-light, #e0e7ff); color: var(--primary, #4f46e5); padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; margin-right: 8px;">Lv. ${user.level || 1}</span>`;
        let userBadges = (user.badges || []).map(b => `<i class="${b.icon}" title="${b.name}" style="color: var(--secondary, #ec4899); margin-right: 6px; font-size: 1.1rem;"></i>`).join('');
        
        const rowHTML = `
            <tr style="opacity: 0; transform: translateX(-20px); animation: slideInX 0.3s ease forwards ${i * 0.05}s;">
                <td class="rank">#${user.rank}</td>
                <td>
                    <div class="user-cell">
                        <img src="${user.avatar || 'https://via.placeholder.com/32'}" alt="User">
                        <span>${user.username}</span>
                    </div>
                </td>
                <td>${user.points}</td>
                <td>
                    <div class="badges" style="display: flex; align-items: center;">
                        ${levelBadge}
                        ${userBadges}
                    </div>
                </td>
            </tr>
        `;
        tableBody.innerHTML += rowHTML;
    }
}

// Add some keyframes for animations since we use inline animations
const lbStyle = document.createElement('style');
lbStyle.textContent = `
    @keyframes fadeIn {
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInX {
        to { opacity: 1; transform: translateX(0); }
    }
`;
document.head.appendChild(lbStyle);
