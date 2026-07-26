/* ============================================================
   MOVIE PLAYER WITH MULTI-SOURCE FALLBACK SYSTEM
   Handles 15 seasonal movies with 4 streaming sources
   ============================================================ */

class MoviePlayer {
    constructor() {
        this.miniplayer = document.getElementById('movieMiniplayer');
        this.container = document.getElementById('miniplayerContainer');
        this.playPauseBtn = document.getElementById('miniplayerPlayPause');
        this.sourceTabsContainer = document.getElementById('sourceTabsContainer');
        this.currentSourceIndex = 0;
        this.currentMovieIndex = 0;
        this.isPlaying = false;
        this.playlist = this.buildMoviePlaylist();
        this.sources = ['coreflix.tv', 'bingebox.to', 'dorawatch.one', 'riverstream.app'];
        this.sourceUrls = {
            'coreflix.tv': 'https://coreflix.tv/embed/',
            'bingebox.to': 'https://bingebox.to/embed/',
            'dorawatch.one': 'https://dorawatch.one/embed/',
            'riverstream.app': 'https://riverstream.app/embed/'
        };
        this.initializePlayer();
        this.setupSourceTabs();
        this.startPlaylist();
    }

    buildMoviePlaylist() {
        const currentMonth = new Date().getMonth();
        const currentDay = new Date().getDate();

        // Determine if we're in Christmas season (after Thanksgiving to Jan 31)
        const isChristmasSeason = currentMonth === 11 || (currentMonth === 0 && currentDay <= 31) || 
                                  (currentMonth === 10 && currentDay >= 22);

        if (isChristmasSeason) {
            return [
                { title: 'Home Alone', year: 1990, imdbId: 'tt0099570', duration: '102 min' },
                { title: 'Home Alone 2: Lost in New York', year: 1992, imdbId: 'tt0104431', duration: '120 min' },
                { title: 'The Polar Express', year: 2004, imdbId: 'tt0338348', duration: '111 min' },
                { title: 'Rudolph the Red-Nosed Reindeer', year: 1964, imdbId: 'tt0059416', duration: '52 min' },
                { title: 'How the Grinch Stole Christmas', year: 2000, imdbId: 'tt0170016', duration: '104 min' },
                { title: 'The Nightmare Before Christmas', year: 1993, imdbId: 'tt0107688', duration: '76 min' },
                { title: 'Edward Scissorhands', year: 1990, imdbId: 'tt0099487', duration: '105 min' },
                { title: 'The Santa Clause', year: 1994, imdbId: 'tt0111070', duration: '97 min' },
                { title: 'A Christmas Carol', year: 2009, imdbId: 'tt1067185', duration: '96 min' },
                { title: 'Rise of the Guardians', year: 2012, imdbId: 'tt1437933', duration: '102 min' },
                { title: 'Elf', year: 2003, imdbId: 'tt0319343', duration: '97 min' },
                { title: 'Carol', year: 2015, imdbId: 'tt0252535', duration: '118 min' },
                { title: 'The Holdovers', year: 2023, imdbId: 'tt10731856', duration: '133 min' },
                { title: 'The Princess Switch', year: 2018, imdbId: 'tt9140560', duration: '110 min' },
                { title: 'The Most Wonderful Time of the Year', year: 2008, imdbId: 'tt1203659', duration: '85 min' }
            ];
        } else if (currentMonth >= 4 && currentMonth <= 7) {
            // Summer movies
            return [
                { title: 'Top Gun: Maverick', year: 2022, imdbId: 'tt1745960', duration: '131 min' },
                { title: 'Barbie', year: 2023, imdbId: 'tt9786160', duration: '114 min' },
                { title: 'Oppenheimer', year: 2023, imdbId: 'tt15398776', duration: '180 min' },
                { title: 'Killers of the Flower Moon', year: 2023, imdbId: 'tt5348170', duration: '206 min' },
                { title: 'Dune: Part Two', year: 2024, imdbId: 'tt13156000', duration: '166 min' },
                { title: 'Inside Out 2', year: 2024, imdbId: 'tt14230458', duration: '96 min' },
                { title: 'A Quiet Place: Day One', year: 2024, imdbId: 'tt8141944', duration: '99 min' },
                { title: 'Deadpool & Wolverine', year: 2024, imdbId: 'tt6217350', duration: '128 min' },
                { title: 'Twisters', year: 2024, imdbId: 'tt11630940', duration: '121 min' },
                { title: 'Trap', year: 2024, imdbId: 'tt7660850', duration: '104 min' },
                { title: 'MaXXXine', year: 2024, imdbId: 'tt27004356', duration: '103 min' },
                { title: 'The Watchers', year: 2024, imdbId: 'tt14273764', duration: '107 min' },
                { title: 'Alien: Romulus', year: 2024, imdbId: 'tt9826228', duration: '119 min' },
                { title: 'Borderlands', year: 2024, imdbId: 'tt6109127', duration: '110 min' },
                { title: 'The Bikeriders', year: 2023, imdbId: 'tt8410628', duration: '116 min' }
            ];
        } else {
            // General all-season library
            return [
                { title: 'Inception', year: 2010, imdbId: 'tt1375666', duration: '148 min' },
                { title: 'Interstellar', year: 2014, imdbId: 'tt0816692', duration: '169 min' },
                { title: 'The Shawshank Redemption', year: 1994, imdbId: 'tt0111161', duration: '142 min' },
                { title: 'Pulp Fiction', year: 1994, imdbId: 'tt0110912', duration: '154 min' },
                { title: 'Forrest Gump', year: 1994, imdbId: 'tt0109830', duration: '142 min' },
                { title: 'The Matrix', year: 1999, imdbId: 'tt0133093', duration: '136 min' },
                { title: 'Goodfellas', year: 1990, imdbId: 'tt0099674', duration: '146 min' },
                { title: 'The Dark Knight', year: 2008, imdbId: 'tt0468569', duration: '152 min' },
                { title: 'Parasite', year: 2019, imdbId: 'tt6751668', duration: '132 min' },
                { title: 'Spirited Away', year: 2001, imdbId: 'tt0245429', duration: '125 min' },
                { title: 'Amélie', year: 2001, imdbId: 'tt0211915', duration: '122 min' },
                { title: 'Stalker', year: 1979, imdbId: 'tt0079944', duration: '163 min' },
                { title: 'Bicycle Thieves', year: 1948, imdbId: 'tt0040897', duration: '89 min' },
                { title: 'Rashomon', year: 1950, imdbId: 'tt0042876', duration: '88 min' },
                { title: 'Eternal Sunshine of the Spotless Mind', year: 2004, imdbId: 'tt0338013', duration: '108 min' }
            ];
        }
    }

    initializePlayer() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        document.getElementById('miniplayerMute').addEventListener('click', () => this.toggleMute());
        document.getElementById('miniplayerFullscreen').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('miniplayerClose').addEventListener('click', () => this.closePlayer());
        document.getElementById('miniplayerMinimize').addEventListener('click', () => this.minimizePlayer());
    }

    setupSourceTabs() {
        const tabs = this.sourceTabsContainer.querySelectorAll('.source-tab');
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => this.switchSource(index));
        });
    }

    switchSource(index) {
        this.currentSourceIndex = index;
        const tabs = this.sourceTabsContainer.querySelectorAll('.source-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        tabs[index].classList.add('active');
        this.loadCurrentMovie();
    }

    loadCurrentMovie() {
        const movie = this.playlist[this.currentMovieIndex];
        const sourceUrl = this.sourceUrls[this.sources[this.currentSourceIndex]];
        const embedUrl = sourceUrl + movie.imdbId;

        this.container.innerHTML = `
            <iframe 
                src="${embedUrl}" 
                frameborder="0" 
                allowfullscreen 
                style="width: 100%; height: 100%; position: absolute; top: 0; left: 0;"
            ></iframe>
        `;

        document.querySelector('.miniplayer-title').textContent = `${movie.title} (${movie.year})`;
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        this.playPauseBtn.textContent = this.isPlaying ? '⏸' : '▶';
        if (!this.isPlaying) {
            this.nextMovie();
        }
    }

    toggleMute() {
        const iframes = this.container.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.style.opacity = iframe.style.opacity === '0.5' ? '1' : '0.5';
        });
    }

    toggleFullscreen() {
        if (this.miniplayer.requestFullscreen) {
            this.miniplayer.requestFullscreen();
        }
    }

    closePlayer() {
        this.miniplayer.style.display = 'none';
    }

    minimizePlayer() {
        this.miniplayer.style.width = '150px';
        this.miniplayer.style.height = '100px';
    }

    nextMovie() {
        this.currentMovieIndex = (this.currentMovieIndex + 1) % this.playlist.length;
        this.loadCurrentMovie();
    }

    startPlaylist() {
        this.loadCurrentMovie();
        setInterval(() => {
            if (this.isPlaying) {
                this.nextMovie();
            }
        }, 300000); // Auto-advance every 5 minutes for demo
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MoviePlayer();
});