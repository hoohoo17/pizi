class PimpleGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 60;
        this.gameActive = false;
        this.pimples = [];
        this.maxPimples = 5;
        this.rankings = JSON.parse(localStorage.getItem('pimpleGameRankings')) || [];
        
        // DOM 요소
        this.gameArea = document.getElementById('gameArea');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.rankingList = document.getElementById('rankingList');
        
        // 이벤트 리스너
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.gameArea.addEventListener('click', (e) => this.handleClick(e));

        // 초기 순위 표시
        this.updateRankingDisplay();
    }

    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.timeLeft = 60;
        this.startButton.style.display = 'none';
        this.restartButton.style.display = 'inline-block';
        this.updateScore();
        this.startTimer();
        this.spawnPimples();
    }

    restartGame() {
        this.pimples.forEach(pimple => pimple.element.remove());
        this.pimples = [];
        this.startGame();
    }

    spawnPimples() {
        if (!this.gameActive) return;

        if (this.pimples.length < this.maxPimples) {
            const pimple = this.createPimple();
            this.pimples.push(pimple);
        }

        setTimeout(() => this.spawnPimples(), 2000);
    }

    createPimple() {
        const pimple = document.createElement('div');
        pimple.className = 'pimple';
        
        // 랜덤 위치
        const x = Math.random() * (this.gameArea.offsetWidth - 60);
        const y = Math.random() * (this.gameArea.offsetHeight - 80);
        
        pimple.style.left = `${x}px`;
        pimple.style.top = `${y}px`;
        
        // 랜덤 크기 (길쭉한 모양)
        const width = Math.random() * 20 + 30;  // 30-50px
        const height = width * 1.5;  // 너비의 1.5배
        pimple.style.width = `${width}px`;
        pimple.style.height = `${height}px`;
        
        // 뿌리 생성
        const rootCount = Math.floor(Math.random() * 3) + 2; // 2-4개의 뿌리
        for (let i = 0; i < rootCount; i++) {
            const root = document.createElement('div');
            root.className = 'root';
            
            // 뿌리 크기와 각도
            const rootLength = Math.random() * 20 + 15;
            const angle = (Math.random() * 40 - 20) + 90; // 70-110도 사이
            
            root.style.width = '2px';
            root.style.height = `${rootLength}px`;
            root.style.transform = `rotate(${angle}deg)`;
            root.style.bottom = '0';
            root.style.left = `${Math.random() * width}px`;
            
            pimple.appendChild(root);
        }
        
        this.gameArea.appendChild(pimple);
        
        return {
            element: pimple,
            size: width,  // 점수 계산에 너비 사용
            popped: false
        };
    }

    handleClick(e) {
        if (!this.gameActive) return;

        const rect = this.gameArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.pimples.forEach((pimple, index) => {
            if (pimple.popped) return;

            const pimpleRect = pimple.element.getBoundingClientRect();
            const pimpleX = pimpleRect.left - rect.left;
            const pimpleY = pimpleRect.top - rect.top;

            if (x >= pimpleX && x <= pimpleX + pimple.size &&
                y >= pimpleY && y <= pimpleY + pimple.size) {
                this.popPimple(index);
            }
        });
    }

    createSplashEffect(x, y, size) {
        const splash = document.createElement('div');
        splash.className = 'splash';
        splash.style.left = `${x}px`;
        splash.style.top = `${y}px`;
        
        // 파티클 생성
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'splash-particle';
            
            // 파티클 크기
            const particleSize = size * 0.2;
            particle.style.width = `${particleSize}px`;
            particle.style.height = `${particleSize}px`;
            
            // 파티클 위치와 방향
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = size * 0.5;
            const startX = Math.cos(angle) * distance;
            const startY = Math.sin(angle) * distance;
            
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            
            splash.appendChild(particle);
        }
        
        this.gameArea.appendChild(splash);
        
        // 애니메이션 종료 후 제거
        setTimeout(() => {
            splash.remove();
        }, 500);
    }

    popPimple(index) {
        const pimple = this.pimples[index];
        if (pimple.popped) return;

        pimple.popped = true;
        pimple.element.classList.add('popped');
        
        // 분출 효과 추가
        const rect = pimple.element.getBoundingClientRect();
        const gameRect = this.gameArea.getBoundingClientRect();
        const x = rect.left - gameRect.left + rect.width / 2;
        const y = rect.top - gameRect.top + rect.height / 2;
        this.createSplashEffect(x, y, pimple.size);
        
        // 점수 계산 (크기에 반비례)
        const points = Math.floor(100 / (pimple.size / 20));
        this.score += points;
        this.updateScore();

        // ASMR 효과음 재생
        this.playPopSound();

        // 애니메이션 후 제거
        setTimeout(() => {
            pimple.element.remove();
            this.pimples.splice(index, 1);
        }, 500);
    }

    playPopSound() {
        const audio = new Audio('pop.mp3'); // 효과음 파일 필요
        audio.volume = 0.3;
        audio.play().catch(() => {}); // 오디오 재생 실패 무시
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    startTimer() {
        const timer = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                clearInterval(timer);
                this.endGame();
            }
        }, 1000);
    }

    updateRankingDisplay() {
        this.rankingList.innerHTML = '';
        const topThree = this.rankings.slice(0, 3);
        
        topThree.forEach((rank, index) => {
            const rankItem = document.createElement('div');
            rankItem.className = `ranking-item rank-${index + 1}`;
            rankItem.innerHTML = `
                <span class="rank">${index + 1}위</span>
                <span class="name">${rank.name}</span>
                <span class="score">${rank.score}점</span>
            `;
            this.rankingList.appendChild(rankItem);
        });
    }

    saveRanking(name, score) {
        this.rankings.push({ name, score });
        this.rankings.sort((a, b) => b.score - a.score);
        this.rankings = this.rankings.slice(0, 3); // 상위 3개만 유지
        localStorage.setItem('pimpleGameRankings', JSON.stringify(this.rankings));
        this.updateRankingDisplay();
    }

    endGame() {
        this.gameActive = false;
        
        // 상위 3위 안에 들었는지 확인
        const isTopThree = this.rankings.length < 3 || this.score > this.rankings[this.rankings.length - 1].score;
        
        if (isTopThree) {
            const name = prompt('축하합니다! 남기고 싶은 이름을 입력해주세요:');
            if (name) {
                this.saveRanking(name, this.score);
            }
        } else {
            alert(`게임 종료! 최종 점수: ${this.score}`);
        }
        
        this.startButton.style.display = 'inline-block';
        this.restartButton.style.display = 'none';
    }
}

// 게임 초기화
const game = new PimpleGame(); 