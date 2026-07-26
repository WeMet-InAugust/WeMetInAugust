/* ============================================================
   CONTENT LOADER SYSTEM
   50+ Placeholder articles with seasonal decorations
   ============================================================ */

class ContentLoader {
    constructor() {
        this.loadAllContent();
        this.decorateWithSeasonalImages();
    }

    loadAllContent() {
        this.loadAstronomyArticles();
        this.loadHistoryArticles();
        this.loadGeographyArticles();
        this.loadNauticalArticles();
        this.loadArtArticles();
        this.loadPhilosophyArticles();
        this.loadFeaturedContent();
    }

    loadAstronomyArticles() {
        const articles = [
            {
                title: 'The Birth of Stars',
                excerpt: 'Exploring the cosmic nurseries where stars are born...',
                image: 'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=400&h=300&fit=crop',
                category: 'Astronomy',
                readTime: '8 min'
            },
            {
                title: 'Black Holes: Gateways to the Unknown',
                excerpt: 'Understanding the universe\'s most mysterious objects...',
                image: 'https://images.unsplash.com/photo-1462331940975-51e2b9b7d298?w=400&h=300&fit=crop',
                category: 'Astrophysics',
                readTime: '10 min'
            },
            {
                title: 'Exoplanets and the Search for Life',
                excerpt: 'Are we alone in the universe? Discovering habitable worlds...',
                image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop',
                category: 'Space Exploration',
                readTime: '9 min'
            },
            {
                title: 'The Cosmic Microwave Background',
                excerpt: 'Decoding the universe\'s oldest light...',
                image: 'https://images.unsplash.com/photo-1462331940975-51e2b9b7d298?w=400&h=300&fit=crop',
                category: 'Cosmology',
                readTime: '11 min'
            },
            {
                title: 'Neutron Stars: Cosmic Laboratories',
                excerpt: 'The densest objects in the universe reveal quantum secrets...',
                image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop',
                category: 'Astrophysics',
                readTime: '9 min'
            },
            {
                title: 'The Andromeda Galaxy',
                excerpt: 'Our nearest galactic neighbor and what it reveals about the universe...',
                image: 'https://images.unsplash.com/photo-1462331940975-51e2b9b7d298?w=400&h=300&fit=crop',
                category: 'Astronomy',
                readTime: '7 min'
            }
        ];

        this.renderArticles('astronomyGrid', articles);
    }

    loadHistoryArticles() {
        const articles = [
            {
                title: 'The Renaissance: Rebirth of Human Achievement',
                excerpt: 'How medieval Europe transformed into the modern world...',
                image: 'https://images.unsplash.com/photo-1578306269057-cbcb6551ce1e?w=400&h=300&fit=crop',
                category: 'History',
                readTime: '12 min'
            },
            {
                title: 'Ancient Rome: Engineering Marvel',
                excerpt: 'The infrastructure that built an empire...',
                image: 'https://images.unsplash.com/photo-1518136247453-74e7b5265980?w=400&h=300&fit=crop',
                category: 'Civilization',
                readTime: '10 min'
            },
            {
                title: 'The Scientific Revolution',
                excerpt: 'How humanity fundamentally changed its understanding of nature...',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
                category: 'Science History',
                readTime: '11 min'
            },
            {
                title: 'The Silk Road: Threads of Civilization',
                excerpt: 'Trade, culture, and ideas crossing continents...',
                image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
                category: 'Trade History',
                readTime: '9 min'
            },
            {
                title: 'Medieval Manuscripts and Knowledge Preservation',
                excerpt: 'How monks saved Western civilization\'s intellectual heritage...',
                image: 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=400&h=300&fit=crop',
                category: 'Cultural History',
                readTime: '8 min'
            },
            {
                title: 'The Age of Enlightenment',
                excerpt: 'Reason, philosophy, and the birth of modern thought...',
                image: 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=400&h=300&fit=crop',
                category: 'History',
                readTime: '13 min'
            }
        ];

        this.renderArticles('historyGrid', articles);
    }

    loadGeographyArticles() {
        const articles = [
            {
                title: 'The Amazon: Earth\'s Lungs',
                excerpt: 'Exploring the world\'s largest rainforest and its role in our climate...',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
                category: 'Ecosystems',
                readTime: '10 min'
            },
            {
                title: 'Mountain Ranges: Shaping Civilizations',
                excerpt: 'How geology influences human culture and settlement...',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
                category: 'Physical Geography',
                readTime: '9 min'
            },
            {
                title: 'Rivers of Culture: The Nile, Tigris, and Indus',
                excerpt: 'How great rivers birthed civilizations...',
                image: 'https://images.unsplash.com/photo-1501426614169-0381eda1e00d?w=400&h=300&fit=crop',
                category: 'Human Geography',
                readTime: '11 min'
            },
            {
                title: 'Deserts: Harsh Beauty and Hidden Life',
                excerpt: 'Discovering ecosystems in Earth\'s most extreme regions...',
                image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
                category: 'Ecosystems',
                readTime: '8 min'
            },
            {
                title: 'Coral Reefs: Rainforests of the Sea',
                excerpt: 'Exploring ocean biodiversity hotspots...',
                image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
                category: 'Marine Geography',
                readTime: '9 min'
            },
            {
                title: 'Urban Landscapes: Cities Across Cultures',
                excerpt: 'How geography shapes urban planning and architecture...',
                image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400&h=300&fit=crop',
                category: 'Human Geography',
                readTime: '10 min'
            }
        ];

        this.renderArticles('geographyGrid', articles);
    }

    loadNauticalArticles() {
        const articles = [
            {
                title: 'The Age of Exploration',
                excerpt: 'How maritime discovery changed the world...',
                image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
                category: 'Maritime History',
                readTime: '12 min'
            },
            {
                title: 'Deep Sea Mysteries',
                excerpt: 'Exploring the ocean\'s most enigmatic depths...',
                image: 'https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=400&h=300&fit=crop',
                category: 'Oceanography',
                readTime: '11 min'
            },
            {
                title: 'Coral Ecosystems Under Threat',
                excerpt: 'Understanding marine biodiversity and conservation...',
                image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
                category: 'Marine Biology',
                readTime: '10 min'
            },
            {
                title: 'Historic Ships and Maritime Innovation',
                excerpt: 'From caravels to container ships: evolution of sea travel...',
                image: 'https://images.unsplash.com/photo-1499209974033-fc4da38a1da8?w=400&h=300&fit=crop',
                category: 'Naval History',
                readTime: '9 min'
            },
            {
                title: 'Ocean Currents: Rivers in the Sea',
                excerpt: 'How water circulation affects climate and life...',
                image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
                category: 'Oceanography',
                readTime: '8 min'
            },
            {
                title: 'Lighthouses: Sentinels of the Sea',
                excerpt: 'Iconic structures guiding mariners through history...',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
                category: 'Maritime Culture',
                readTime: '7 min'
            }
        ];

        this.renderArticles('nauticalGrid', articles);
    }

    loadArtArticles() {
        const articles = [
            {
                title: 'The Renaissance Masters',
                excerpt: 'Leonardo, Michelangelo, and Raphael revolutionized art...',
                image: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=400&h=300&fit=crop',
                category: 'Painting',
                readTime: '11 min'
            },
            {
                title: 'Impressionism: Capturing Light',
                excerpt: 'Monet, Renoir, and the revolution of perception...',
                image: 'https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=400&h=300&fit=crop',
                category: 'Art Movement',
                readTime: '10 min'
            },
            {
                title: 'Cinema as Art Form',
                excerpt: 'How film became the defining artistic medium of the 20th century...',
                image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop',
                category: 'Film',
                readTime: '12 min'
            },
            {
                title: 'Fashion Through the Ages',
                excerpt: 'Clothing as cultural expression and social history...',
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
                category: 'Fashion',
                readTime: '9 min'
            },
            {
                title: 'Modernist Architecture',
                excerpt: 'Form follows function: designing the modern world...',
                image: 'https://images.unsplash.com/photo-1479839672679-a46482f0b7c8?w=400&h=300&fit=crop',
                category: 'Architecture',
                readTime: '10 min'
            },
            {
                title: 'Photography: Freezing Time',
                excerpt: 'How photography transformed art and documentation...',
                image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=300&fit=crop',
                category: 'Photography',
                readTime: '8 min'
            }
        ];

        this.renderArticles('artGallery', articles);
    }

    loadPhilosophyArticles() {
        const articles = [
            {
                title: 'Plato\'s Cave: Allegory of Reality',
                excerpt: 'What is real? Ancient philosophy questioning existence...',
                image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop',
                category: 'Epistemology',
                readTime: '9 min'
            },
            {
                title: 'Descartes and the Mind-Body Problem',
                excerpt: 'Consciousness, matter, and the nature of human existence...',
                image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
                category: 'Metaphysics',
                readTime: '10 min'
            },
            {
                title: 'Kant\'s Critique of Pure Reason',
                excerpt: 'How we know what we know: foundations of modern philosophy...',
                image: 'https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=400&h=300&fit=crop',
                category: 'Epistemology',
                readTime: '12 min'
            },
            {
                title: 'Nietzsche: Beyond Good and Evil',
                excerpt: 'Challenging morality and the will to power...',
                image: 'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=400&h=300&fit=crop',
                category: 'Ethics',
                readTime: '11 min'
            },
            {
                title: 'Existentialism and Authenticity',
                excerpt: 'Sartre, Camus, and the meaning of freedom...',
                image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop',
                category: 'Existentialism',
                readTime: '10 min'
            },
            {
                title: 'The Ethics of Care',
                excerpt: 'Contemporary philosophy and human relationships...',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
                category: 'Ethics',
                readTime: '8 min'
            }
        ];

        this.renderArticles('philosophyGrid', articles);
    }

    loadFeaturedContent() {
        const featured = [
            { title: 'The Universe Expanded', category: 'Astronomy' },
            { title: 'Hidden Histories Revealed', category: 'History' },
            { title: 'Art in Motion', category: 'Film' }
        ];

        const featuredArticles = document.getElementById('featuredArticles');
        const featuredVideos = document.getElementById('featuredVideos');
        const featuredInterviews = document.getElementById('featuredInterviews');

        if (featuredArticles) {
            featured.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.title;
                featuredArticles.appendChild(li);
            });
        }

        if (featuredVideos) {
            featured.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item.title;
                featuredVideos.appendChild(li);
            });
        }

        if (featuredInterviews) {
            featured.forEach(item => {
                const li = document.createElement('li');
                li.textContent = 'Interview: ' + item.title;
                featuredInterviews.appendChild(li);
            });
        }
    }

    renderArticles(containerId, articles) {
        const container = document.getElementById(containerId);
        if (!container) return;

        articles.forEach(article => {
            const articleEl = document.createElement('div');
            articleEl.className = 'article-card';
            articleEl.innerHTML = `
                <div class="article-image" style="background-image: url('${article.image}'); background-size: cover; height: 200px; border-radius: 8px 8px 0 0;"></div>
                <div class="article-content">
                    <span class="article-category">${article.category}</span>
                    <h3>${article.title}</h3>
                    <p>${article.excerpt}</p>
                    <div class="article-meta">
                        <span class="read-time">📖 ${article.readTime}</span>
                    </div>
                </div>
            `;
            container.appendChild(articleEl);
        });
    }

    decorateWithSeasonalImages() {
        const season = this.getCurrentSeason();
        const decorations = this.getSeasonalDecorations(season);

        // Add decorative background elements to sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach((section, index) => {
            if (decorations[index % decorations.length]) {
                const img = new Image();
                img.src = decorations[index % decorations.length];
                img.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0.05;
                    object-fit: cover;
                    pointer-events: none;
                    z-index: 0;
                `;
                section.style.position = 'relative';
                section.appendChild(img);
            }
        });
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 10 || month < 2) return 'winter';
        if (month >= 2 && month < 5) return 'spring';
        if (month >= 5 && month < 8) return 'summer';
        return 'autumn';
    }

    getSeasonalDecorations(season) {
        const decorations = {
            winter: [
                'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1478505143387-395e1f1db1d9?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1543873543-af747c7e5b0c?w=800&h=600&fit=crop'
            ],
            spring: [
                'https://images.unsplash.com/photo-1490195987553-1305c46dd02a?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop'
            ],
            summer: [
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?w=800&h=600&fit=crop'
            ],
            autumn: [
                'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop'
            ]
        };

        return decorations[season] || decorations.summer;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ContentLoader();
});