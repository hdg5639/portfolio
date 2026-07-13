'use strict';

(() => {
  const STORAGE_KEY = 'iam_donggyun_mpa_v3';
  const PAGE_IDS = ['home', 'lifestyle', 'projects', 'tmi'];

  const defaultState = {
    xp: 0,
    visited: {},
    badges: {
      greeting: false,
      explorer: false,
      empathy: false,
      quiz: false
    },
    likedProjects: [],
    balanceChoices: {},
    rewardedBalances: [],
    rewardedQuizQuestions: []
  };

  const state = loadState();
  let toastTimer = null;
  let activeFilter = 'all';
  let quizIndex = 0;
  let quizCorrect = 0;
  let quizLocked = false;

  const detailContent = {
    likes: {
      icon: '💚',
      title: '좋아하는 것들',
      html: '<p>피아노를 치면서 머리를 식히거나, FPS·RPG 게임에 오래 몰입하는 것을 좋아합니다. 자동차나 전자기기를 살 계획이 없어도 스펙과 실사용 후기를 비교해보는 것 자체를 즐깁니다.</p>'
    },
    dislikes: {
      icon: '🙅',
      title: '잘 맞지 않는 것들',
      html: '<p>이유를 설명할 수 없는 반복 작업, 말의 앞뒤가 맞지 않는 상황, 책임질 준비 없이 일을 먼저 벌이는 태도를 답답하게 느낍니다. 다만 무조건 싫어하기보다 왜 그런 방식이 되었는지부터 확인하려고 합니다.</p>'
    },
    routine: {
      icon: '🏠',
      title: '평소 생활 방식',
      html: '<p>SSAFY 일정을 제외하면 집에서 보내는 시간이 많습니다. 게임이나 피아노로 쉬고, 너무 오래 집에만 있어 답답할 때는 목적지를 정하지 않고 드라이브를 나갑니다. 소비할 때는 먼저 성능을 확인한 뒤 가격과 사용 기간을 비교합니다.</p>'
    }
  };

  const quizData = [
    {
      question: '한동균의 MBTI는 무엇일까요?',
      options: ['ENFP', 'ISTP', 'ISFJ', 'ENTJ'],
      answer: 1,
      feedback: 'ISTP입니다. 계획을 세밀하게 고정하기보다 큰 방향만 잡고 상황에 맞춰 움직이는 편입니다.'
    },
    {
      question: '한동균이 에너지를 충전하는 가장 대표적인 방법은?',
      options: ['매일 큰 모임 참석', '혼자만의 시간 보내기', '새벽 등산', '하루 종일 전화하기'],
      answer: 1,
      feedback: '혼자 보내는 시간이 가장 중요한 충전 방식입니다.'
    },
    {
      question: '답답할 때 한동균이 자주 선택하는 활동은?',
      options: ['목적지 없는 드라이브', '노래방 단체 모임', '새벽 달리기', '쇼핑몰 방문'],
      answer: 0,
      feedback: '차를 타고 한적한 길을 달리며 머리를 식히는 편입니다.'
    },
    {
      question: '한동균이 좋아하는 게임 장르 조합은?',
      options: ['AOS와 리듬게임', '퍼즐과 스포츠', 'FPS와 RPG', '카드와 레이싱만'],
      answer: 2,
      feedback: 'FPS와 RPG를 좋아하고 AOS는 상대적으로 선호하지 않습니다.'
    },
    {
      question: '물건을 고를 때 가장 먼저 확인하는 것은?',
      options: ['광고 모델', '디자인 색상', '성능과 스펙', '판매량 순위'],
      answer: 2,
      feedback: '성능과 스펙을 먼저 파악하고 나서 후보와 가격을 비교합니다.'
    },
    {
      question: '다음 중 한동균이 가장 답답해할 상황은?',
      options: ['혼자 게임하는 저녁', '이유 없는 반복 작업', '피아노 연습', '자동차 스펙 비교'],
      answer: 1,
      feedback: '이유 없이 비효율적인 작업이 반복되는 상황을 특히 답답하게 느낍니다.'
    },
    {
      question: '개인 서버 기반 IaaS 프로젝트의 이름은?',
      options: ['Eventory', '새로고침', 'GamjaBox', 'Study Match'],
      answer: 2,
      feedback: 'GamjaBox입니다. VM 생성과 접속 환경 구성을 자동화한 프로젝트입니다.'
    },
    {
      question: '한동균이 집중할 때 더 편한 환경은?',
      options: ['완전한 무음', '약간의 생활 소음', '아주 큰 음악', '계속 울리는 알림'],
      answer: 1,
      feedback: '너무 조용한 곳보다 약간의 백색소음이나 생활 소음이 있는 환경을 선호합니다.'
    }
  ];

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupNavigation();
    setupModal();
    setupGreeting();
    setupRevealAnimation();
    setupLifestyleDetails();
    setupBalanceGame();
    setupProjectFilter();
    setupProjectLikes();
    setupQuiz();
    setupReset();

    registerPageVisit(document.body.dataset.page || 'home');
    refreshUI();
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return {
        ...defaultState,
        ...parsed,
        visited: { ...defaultState.visited, ...(parsed.visited || {}) },
        badges: { ...defaultState.badges, ...(parsed.badges || {}) },
        likedProjects: Array.isArray(parsed.likedProjects) ? parsed.likedProjects : [],
        balanceChoices: parsed.balanceChoices && typeof parsed.balanceChoices === 'object' ? parsed.balanceChoices : {},
        rewardedBalances: Array.isArray(parsed.rewardedBalances) ? parsed.rewardedBalances : [],
        rewardedQuizQuestions: Array.isArray(parsed.rewardedQuizQuestions) ? parsed.rewardedQuizQuestions : []
      };
    } catch (error) {
      console.warn('저장된 상태를 불러오지 못해 초기 상태로 시작합니다.', error);
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('브라우저 저장소에 상태를 저장하지 못했습니다.', error);
    }
  }

  function setupNavigation() {
    const currentPage = document.body.dataset.page;
    document.querySelectorAll('[data-page]').forEach((link) => {
      link.classList.toggle('active', link.dataset.page === currentPage);
    });

    const menuButton = document.querySelector('#menu-button');
    const mobileNav = document.querySelector('#mobile-nav');
    if (!menuButton || !mobileNav) return;

    menuButton.addEventListener('click', () => {
      const opened = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(opened));
    });

    mobileNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        mobileNav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function registerPageVisit(pageId) {
    if (!PAGE_IDS.includes(pageId) || state.visited[pageId]) return;

    state.visited[pageId] = true;
    addXP(5, '새 페이지 발견!', '처음 방문한 페이지라 5 XP를 획득했습니다.');

    const allVisited = PAGE_IDS.every((page) => state.visited[page]);
    if (allVisited) {
      unlockBadge('explorer', 20, '페이지 탐험가 배지 획득!', '네 개의 페이지를 모두 둘러봤습니다.');
    }
  }

  function addXP(amount, title, message) {
    state.xp = Math.max(0, Number(state.xp || 0) + amount);
    saveState();
    refreshUI();
    if (title && message) showToast(title, message);
  }

  function unlockBadge(badgeKey, bonusXP, title, message) {
    if (state.badges[badgeKey]) return false;
    state.badges[badgeKey] = true;
    state.xp += bonusXP;
    saveState();
    refreshUI();
    showToast(title, `${message} 보너스 ${bonusXP} XP!`);
    return true;
  }

  function refreshUI() {
    const badgeCount = Object.values(state.badges).filter(Boolean).length;
    setText('#header-xp', `${state.xp} XP`);
    setText('#header-badges', `${badgeCount}/4`);

    const progress = document.querySelector('#xp-progress');
    const xpLabel = document.querySelector('#xp-label');
    const levelName = document.querySelector('#level-name');
    if (progress && xpLabel && levelName) {
      progress.value = Math.min(state.xp, 200);
      xpLabel.textContent = `${state.xp} / 200 XP`;
      levelName.textContent = state.xp >= 150 ? '설명서 마스터' : state.xp >= 70 ? '가까운 이웃' : '탐색 중';
    }

    document.querySelectorAll('.badge-item').forEach((badge) => {
      badge.classList.toggle('unlocked', Boolean(state.badges[badge.dataset.badge]));
    });

    document.querySelectorAll('.like-button').forEach((button) => {
      const liked = state.likedProjects.includes(button.dataset.project);
      button.classList.toggle('liked', liked);
      button.innerHTML = `${liked ? '♥' : '♡'} <span>${liked ? '공감함' : '좋아요'}</span>`;
      button.setAttribute('aria-pressed', String(liked));
    });

    document.querySelectorAll('.balance-row').forEach((row) => {
      const selected = state.balanceChoices[row.dataset.balance];

      row.querySelectorAll('[data-choice]').forEach((button) => {
        button.classList.toggle('selected', button.dataset.choice === selected);
        button.setAttribute('aria-pressed', String(button.dataset.choice === selected));
      });

      // 방문자가 선택하기 전에는 동균의 선택을 숨기고,
      // 한 번이라도 선택한 뒤에만 정답 문구를 공개합니다.
      const donggyunChoice = row.querySelector('.donggyun-choice');
      if (donggyunChoice) {
        donggyunChoice.hidden = !selected;
      }
    });
  }

  function setupGreeting() {
    const button = document.querySelector('#greeting-button');
    if (!button) return;

    button.addEventListener('click', () => {
      openModal('👋', '반갑습니다!', '<p>찾아와 주셔서 감사합니다. 낯은 조금 가리지만 먼저 인사해주면 금방 편해지는 편입니다.</p>');
      if (!state.badges.greeting) {
        unlockBadge('greeting', 15, '첫인사 배지 획득!', '첫 인사를 남겨주셨습니다.');
      } else {
        showToast('이미 인사한 사이입니다', '오늘도 찾아와 주셔서 감사합니다.');
      }
    });
  }

  function setupLifestyleDetails() {
    document.querySelectorAll('.detail-button').forEach((button) => {
      button.addEventListener('click', () => {
        const detail = detailContent[button.dataset.detail];
        if (!detail) return;
        openModal(detail.icon, detail.title, detail.html);
      });
    });
  }

  function setupBalanceGame() {
    document.querySelectorAll('.balance-row').forEach((row) => {
      row.addEventListener('click', (event) => {
        const button = event.target.closest('[data-choice]');
        if (!button) return;

        const key = row.dataset.balance;
        state.balanceChoices[key] = button.dataset.choice;
        const isFirstReward = !state.rewardedBalances.includes(key);
        if (isFirstReward) state.rewardedBalances.push(key);
        saveState();
        refreshUI();

        if (isFirstReward) {
          addXP(3, '취향 선택 완료!', `${button.dataset.choice} 쪽을 선택해 3 XP를 획득했습니다.`);
        } else {
          showToast('선택 변경 완료', `${button.dataset.choice} 쪽으로 선택을 바꿨습니다.`);
        }
      });
    });
  }

  function setupProjectFilter() {
    const searchInput = document.querySelector('#project-search');
    const cards = [...document.querySelectorAll('.project-card')];
    const emptyState = document.querySelector('#project-empty');
    const filterButtons = [...document.querySelectorAll('.filter-button')];
    if (!searchInput || cards.length === 0) return;

    const applyFilter = () => {
      const query = searchInput.value.trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach((card) => {
        const categoryMatch = activeFilter === 'all' || card.dataset.category === activeFilter;
        const searchMatch = !query || card.dataset.search.toLowerCase().includes(query) || card.textContent.toLowerCase().includes(query);
        const visible = categoryMatch && searchMatch;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      if (emptyState) emptyState.hidden = visibleCount !== 0;
    };

    searchInput.addEventListener('input', applyFilter);
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.dataset.filter;
        filterButtons.forEach((item) => item.classList.toggle('active', item === button));
        applyFilter();
      });
    });
  }

  function setupProjectLikes() {
    document.querySelectorAll('.like-button').forEach((button) => {
      button.addEventListener('click', () => {
        const projectId = button.dataset.project;
        const wasLiked = state.likedProjects.includes(projectId);

        if (wasLiked) {
          state.likedProjects = state.likedProjects.filter((id) => id !== projectId);
          saveState();
          refreshUI();
          showToast('공감 취소', '좋아요를 취소했습니다. 획득한 XP는 유지됩니다.');
          return;
        }

        state.likedProjects.push(projectId);
        saveState();
        refreshUI();
        addXP(7, '프로젝트 공감!', '좋아요를 눌러 7 XP를 획득했습니다.');

        if (state.likedProjects.length >= 2) {
          unlockBadge('empathy', 20, '공감 요정 배지 획득!', '두 개 이상의 프로젝트에 공감을 남겼습니다.');
        }
      });
    });
  }

  function setupQuiz() {
    if (!document.querySelector('#quiz-area')) return;

    document.querySelector('#quiz-retry')?.addEventListener('click', () => {
      quizIndex = 0;
      quizCorrect = 0;
      quizLocked = false;
      document.querySelector('#quiz-result').hidden = true;
      document.querySelector('#quiz-area').hidden = false;
      renderQuiz();
    });

    renderQuiz();
  }

  function renderQuiz() {
    const questionElement = document.querySelector('#quiz-question');
    const optionsElement = document.querySelector('#quiz-options');
    const feedbackElement = document.querySelector('#quiz-feedback');
    const counterElement = document.querySelector('#quiz-counter');
    const progressBar = document.querySelector('#quiz-progress-bar');
    if (!questionElement || !optionsElement || !feedbackElement || !counterElement || !progressBar) return;

    quizLocked = false;
    const item = quizData[quizIndex];
    questionElement.textContent = item.question;
    counterElement.textContent = `${quizIndex + 1} / ${quizData.length}`;
    progressBar.style.width = `${(quizIndex / quizData.length) * 100}%`;
    feedbackElement.hidden = true;
    feedbackElement.textContent = '';
    optionsElement.innerHTML = '';

    item.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      button.innerHTML = `<span>${index + 1}</span><span>${escapeHTML(option)}</span>`;
      button.addEventListener('click', () => answerQuiz(index));
      optionsElement.appendChild(button);
    });
  }

  function answerQuiz(selectedIndex) {
    if (quizLocked) return;
    quizLocked = true;

    const item = quizData[quizIndex];
    const buttons = [...document.querySelectorAll('.quiz-option')];
    const feedbackElement = document.querySelector('#quiz-feedback');
    const correct = selectedIndex === item.answer;

    buttons.forEach((button, index) => {
      button.disabled = true;
      if (index === item.answer) button.classList.add('correct');
      if (index === selectedIndex && !correct) button.classList.add('wrong');
    });

    if (correct) {
      quizCorrect += 1;
      if (!state.rewardedQuizQuestions.includes(quizIndex)) {
        state.rewardedQuizQuestions.push(quizIndex);
        addXP(5, '정답!', '처음 맞힌 문제라 5 XP를 획득했습니다.');
      }
    }

    if (feedbackElement) {
      feedbackElement.textContent = `${correct ? '정답입니다.' : '아쉽습니다.'} ${item.feedback}`;
      feedbackElement.hidden = false;
    }

    window.setTimeout(() => {
      quizIndex += 1;
      if (quizIndex >= quizData.length) {
        finishQuiz();
      } else {
        renderQuiz();
      }
    }, 1150);
  }

  function finishQuiz() {
    const quizArea = document.querySelector('#quiz-area');
    const result = document.querySelector('#quiz-result');
    const score = document.querySelector('#quiz-score');
    const progressBar = document.querySelector('#quiz-progress-bar');
    if (quizArea) quizArea.hidden = true;
    if (result) result.hidden = false;
    if (score) score.textContent = `${quizData.length}문제 중 ${quizCorrect}문제를 맞혔습니다.`;
    if (progressBar) progressBar.style.width = '100%';

    if (!state.badges.quiz) {
      unlockBadge('quiz', 25, '퀴즈 완주 배지 획득!', '모든 문제를 끝까지 풀었습니다.');
    } else {
      showToast('퀴즈 재완주!', `${quizCorrect}문제를 맞혔습니다.`);
    }
  }

  function setupReset() {
    const button = document.querySelector('#reset-button');
    if (!button) return;

    button.addEventListener('click', () => {
      const confirmed = window.confirm('XP, 배지, 좋아요, 선택 기록을 모두 초기화할까요?');
      if (!confirmed) return;
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    });
  }

  function setupRevealAnimation() {
    const targets = document.querySelectorAll('.reveal-card');
    if (targets.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18 });

    targets.forEach((target) => observer.observe(target));
  }

  function setupModal() {
    const backdrop = document.querySelector('#modal-backdrop');
    const closeButton = document.querySelector('#modal-close');
    if (!backdrop || !closeButton) return;

    closeButton.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) closeModal();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !backdrop.hidden) closeModal();
    });
  }

  function openModal(icon, title, html) {
    const backdrop = document.querySelector('#modal-backdrop');
    const iconElement = document.querySelector('#modal-icon');
    const titleElement = document.querySelector('#modal-title');
    const contentElement = document.querySelector('#modal-content');
    if (!backdrop || !iconElement || !titleElement || !contentElement) return;

    iconElement.textContent = icon;
    titleElement.textContent = title;
    contentElement.innerHTML = html;
    backdrop.hidden = false;
    document.body.classList.add('modal-open');
    document.querySelector('#modal-close')?.focus();
  }

  function closeModal() {
    const backdrop = document.querySelector('#modal-backdrop');
    if (!backdrop) return;
    backdrop.hidden = true;
    document.body.classList.remove('modal-open');
  }

  function showToast(title, message) {
    const toast = document.querySelector('#toast');
    if (!toast) return;
    setText('#toast-title', title);
    setText('#toast-message', message);
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
