/* ============================================================
   ADMIN DASHBOARD - PASSWORD PROTECTED
   Content management system
   ============================================================ */

class AdminDashboard {
    constructor() {
        this.correctPassword = 'ThatsKiraYoshikageNotKosakuKawajiri44.?';
        this.isAuthenticated = false;
        this.setupAccessPoint();
    }

    setupAccessPoint() {
        // Secret keyboard shortcut: Ctrl+Shift+A
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                this.requestAuthentication();
            }
        }
        );
    }

    requestAuthentication() {
        const password = prompt('Enter admin password:');
        if (password === this.correctPassword) {
            this.isAuthenticated = true;
            this.openDashboard();
        } else if (password !== null) {
            alert('Incorrect password.');
        }
    }

    openDashboard() {
        const dashboard = document.getElementById('adminDashboard');
        dashboard.classList.remove('hidden');
        dashboard.innerHTML = this.renderDashboard();
        this.setupDashboardEvents();
    }

    renderDashboard() {
        return `
            <div class="admin-panel">
                <div class="admin-header">
                    <h1>🔐 Admin Control Panel</h1>
                    <button class="admin-close" onclick="document.getElementById('adminDashboard').classList.add('hidden')">✕</button>
                </div>
                <div class="admin-content">
                    <div class="admin-section">
                        <h2>📝 Add New Article</h2>
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="articleTitle" placeholder="Article title">
                        </div>
                        <div class="form-group">
                            <label>Section</label>
                            <select id="articleSection">
                                <option>Astronomy</option>
                                <option>History</option>
                                <option>Geography</option>
                                <option>Nautical</option>
                                <option>Art</option>
                                <option>Philosophy</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Excerpt</label>
                            <textarea id="articleExcerpt" placeholder="Brief excerpt"></textarea>
                        </div>
                        <div class="form-group">
                            <button onclick="adminDash.addArticle()">Add Article</button>
                        </div>
                    </div>

                    <div class="admin-section">
                        <h2>🎬 Add New Video</h2>
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="videoTitle" placeholder="Video title">
                        </div>
                        <div class="form-group">
                            <label>YouTube URL</label>
                            <input type="url" id="videoUrl" placeholder="https://youtube.com/...">
                        </div>
                        <div class="form-group">
                            <label>Category</label>
                            <select id="videoCategory">
                                <option>Astronomy</option>
                                <option>History</option>
                                <option>Art</option>
                                <option>Science</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <button onclick="adminDash.addVideo()">Add Video</button>
                        </div>
                    </div>

                    <div class="admin-section">
                        <h2>🌍 Seasonal Settings</h2>
                        <div class="form-group">
                            <label>Current Season</label>
                            <select id="currentSeason">
                                <option>Winter</option>
                                <option>Spring</option>
                                <option>Summer</option>
                                <option>Autumn</option>
                                <option>Christmas</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Theme</label>
                            <select id="siteTheme">
                                <option>Light</option>
                                <option>Dark</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <button onclick="adminDash.updateSettings()">Save Settings</button>
                        </div>
                    </div>

                    <div class="admin-section">
                        <h2>💿 Content Management</h2>
                        <div class="form-group">
                            <label>Site Logo Text</label>
                            <input type="text" id="logoText" placeholder="?!">
                        </div>
                        <div class="form-group">
                            <label>Navbar Title</label>
                            <input type="text" id="navTitle" placeholder="We Met In August">
                        </div>
                        <div class="form-group">
                            <label>Footer Quote</label>
                            <textarea id="footerQuote" placeholder="Website quote"></textarea>
                        </div>
                        <div class="form-group">
                            <button onclick="adminDash.updateContent()">Update Content</button>
                        </div>
                    </div>

                    <div class="admin-section">
                        <h2>📊 Statistics</h2>
                        <div class="form-group">
                            <p><strong>Total Articles:</strong> <span id="totalArticles">0</span></p>
                            <p><strong>Total Videos:</strong> <span id="totalVideos">0</span></p>
                            <p><strong>Site Views:</strong> <span id="siteViews">0</span></p>
                            <p><strong>Last Update:</strong> <span id="lastUpdate">Never</span></p>
                        </div>
                    </div>

                    <div class="admin-section">
                        <h2>🔧 Tools</h2>
                        <div class="form-group">
                            <button onclick="adminDash.clearCache()" style="background: #FF9800;">Clear Cache</button>
                        </div>
                        <div class="form-group">
                            <button onclick="adminDash.exportData()" style="background: #2196F3;">Export Data</button>
                        </div>
                        <div class="form-group">
                            <button onclick="adminDash.resetToDefault()" style="background: #F44336;">Reset to Default</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupDashboardEvents() {
        this.loadSettings();
    }

    addArticle() {
        const title = document.getElementById('articleTitle').value;
        const section = document.getElementById('articleSection').value;
        const excerpt = document.getElementById('articleExcerpt').value;

        if (!title || !excerpt) {
            alert('Please fill in all fields');
            return;
        }

        const articles = JSON.parse(localStorage.getItem('customArticles') || '[]');
        articles.push({ title, section, excerpt, date: new Date().toLocaleDateString() });
        localStorage.setItem('customArticles', JSON.stringify(articles));
        alert('Article added successfully!');
        document.getElementById('articleTitle').value = '';
        document.getElementById('articleExcerpt').value = '';
    }

    addVideo() {
        const title = document.getElementById('videoTitle').value;
        const url = document.getElementById('videoUrl').value;
        const category = document.getElementById('videoCategory').value;

        if (!title || !url) {
            alert('Please fill in all fields');
            return;
        }

        const videos = JSON.parse(localStorage.getItem('customVideos') || '[]');
        videos.push({ title, url, category, date: new Date().toLocaleDateString() });
        localStorage.setItem('customVideos', JSON.stringify(videos));
        alert('Video added successfully!');
        document.getElementById('videoTitle').value = '';
        document.getElementById('videoUrl').value = '';
    }

    updateSettings() {
        const season = document.getElementById('currentSeason').value;
        const theme = document.getElementById('siteTheme').value;

        localStorage.setItem('currentSeason', season);
        localStorage.setItem('siteTheme', theme);

        if (theme === 'Dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        alert('Settings updated!');
    }

    updateContent() {
        const logo = document.getElementById('logoText').value;
        const title = document.getElementById('navTitle').value;
        const quote = document.getElementById('footerQuote').value;

        localStorage.setItem('siteLogo', logo);
        localStorage.setItem('siteTitle', title);
        localStorage.setItem('siteQuote', quote);

        alert('Content updated!');
    }

    clearCache() {
        localStorage.clear();
        sessionStorage.clear();
        alert('Cache cleared!');
        location.reload();
    }

    exportData() {
        const data = {
            articles: JSON.parse(localStorage.getItem('customArticles') || '[]'),
            videos: JSON.parse(localStorage.getItem('customVideos') || '[]'),
            settings: {
                season: localStorage.getItem('currentSeason'),
                theme: localStorage.getItem('siteTheme')
            }
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wemetinaugust-backup-${new Date().toISOString()}.json`;
        link.click();
    }

    resetToDefault() {
        if (confirm('Are you sure? This will reset all customizations.')) {
            localStorage.clear();
            alert('Site reset to default!');
            location.reload();
        }
    }

    loadSettings() {
        document.getElementById('totalArticles').textContent = JSON.parse(localStorage.getItem('customArticles') || '[]').length + 6;
        document.getElementById('totalVideos').textContent = JSON.parse(localStorage.getItem('customVideos') || '[]').length + 15;
        document.getElementById('siteViews').textContent = localStorage.getItem('siteViews') || '0';
        document.getElementById('lastUpdate').textContent = localStorage.getItem('lastUpdate') || 'System initialized';
    }
}

// Global instance
let adminDash = new AdminDashboard();

// Track page views
document.addEventListener('DOMContentLoaded', () => {
    const views = parseInt(localStorage.getItem('siteViews') || '0') + 1;
    localStorage.setItem('siteViews', views);
    localStorage.setItem('lastUpdate', new Date().toLocaleString());
});
