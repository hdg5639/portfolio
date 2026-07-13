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
      id: 'hard-quiz-v1-q1',
      question: '다음 중 한동균의 평소 행동 방식에 가장 가까운 설명은?',
      options: [
        '세부 계획을 먼저 완성한 뒤, 정해진 순서를 되도록 바꾸지 않는다.',
        '큰 틀만 잡아두고, 나머지는 상황을 보면서 맞춰가는 편이다.',
        '일단 빠르게 시작하지만 흥미가 줄면 결과와 관계없이 바로 다른 일로 넘어간다.',
        '직접 판단하기보다 주변 사람들의 선택을 모아 가장 많은 의견을 따른다.'
      ],
      answer: 1,
      feedback: '큰 틀은 잡되 세부 실행은 상황에 맞춰 바꾸는 편입니다.'
    },
    {
      id: 'hard-quiz-v1-q2',
      question: 'SSAFY 일정을 마친 뒤 머리가 복잡한 날의 행동으로 가장 가능성이 높은 것은?',
      options: [
        '바로 사람을 많이 불러 모아 늦게까지 이야기한다.',
        '집에서 게임이나 피아노로 쉬다가, 계속 답답하면 목적지 없이 드라이브를 나간다.',
        '집에 들어가지 않고 쇼핑몰을 돌아다니며 충동구매로 기분을 전환한다.',
        '완전히 조용한 공간에서 아무 소리 없이 오래 명상한다.'
      ],
      answer: 1,
      feedback: '기본적으로 집에서 혼자 쉬고, 답답함이 남으면 목적지 없는 드라이브로 머리를 식히는 편입니다.'
    },
    {
      id: 'hard-quiz-v1-q3',
      question: '한동균이 물건을 살 때의 판단 순서를 가장 정확하게 나열한 것은?',
      options: [
        '가격 비교 → 판매량 확인 → 성능 확인',
        '후기 확인 → 디자인 선택 → 가격 비교',
        '성능과 스펙 확인 → 후보 비교 → 가격 비교',
        '브랜드 선택 → 최저가 검색 → 세부 성능 확인'
      ],
      answer: 2,
      feedback: '먼저 성능과 스펙을 파악하고 후보를 좁힌 다음, 마지막에 가격과 가성비를 비교합니다.'
    },
    {
      id: 'hard-quiz-v1-q4',
      question: '집중할 때 선호하는 환경과 커피 습관의 조합으로 맞는 것은?',
      options: [
        '완전한 무음 환경 · 작은 커피를 짧은 시간 안에 마심',
        '약간의 생활 소음 · 큰 커피 하나를 옆에 두고 오래 나눠 마심',
        '큰 음악이 계속 나오는 환경 · 커피는 거의 마시지 않음',
        '사람들의 대화가 매우 큰 환경 · 여러 잔을 빠르게 마심'
      ],
      answer: 1,
      feedback: '너무 조용한 곳보다는 약간의 생활 소음을 선호하고, 큰 커피 하나를 오래 조금씩 마시는 편입니다.'
    },
    {
      id: 'hard-quiz-v1-q5',
      question: '한동균의 음악과 게임 취향을 모두 맞게 묶은 것은?',
      options: [
        'Back Number를 자주 듣고, FPS와 RPG를 선호하며 AOS는 덜 좋아한다.',
        'Back Number를 자주 듣고, AOS와 리듬게임을 가장 좋아한다.',
        '록 음악은 거의 듣지 않고, 스포츠와 퍼즐 게임만 선호한다.',
        '잔잔한 음악보다 강한 음악만 듣고, FPS는 피하는 편이다.'
      ],
      answer: 0,
      feedback: '요즘 Back Number를 자주 듣고, 게임은 FPS와 RPG를 좋아하며 AOS는 상대적으로 선호하지 않습니다.'
    },
    {
      id: 'hard-quiz-v1-q6',
      question: '프로젝트와 만든 이유가 올바르게 연결된 조합은?',
      options: [
        'GamjaBox — 행사 추천 / Eventory — VM 생성과 접속 자동화',
        '출결 관리 시스템 — 수기 출석 누락 감소 / GamjaBox — VM 생성과 접속 환경 자동화',
        '새로고침 — 개인 서버 관리 / 출결 관리 시스템 — AI 행사 추천',
        'Eventory — 동아리 출석 관리 / 새로고침 — 자동차 스펙 비교'
      ],
      answer: 1,
      feedback: '출결 관리 시스템은 수기 출석의 누락을 줄이기 위해, GamjaBox는 VM과 접속 환경 구성을 자동화하기 위해 만들었습니다.'
    },
    {
      id: 'hard-quiz-v1-q7',
      question: '다음 중 한동균의 성향과 가장 거리가 먼 행동은?',
      options: [
        '관심이 생긴 주제를 스펙과 후기까지 비교하며 오래 살펴본다.',
        '혼자 있는 시간을 보내다가 너무 답답하면 밖으로 나간다.',
        '이유를 충분히 이해하지 못해도 인기 있는 선택이면 그대로 따른다.',
        '처음에는 조용하지만 편해진 사람 앞에서는 장난과 말이 늘어난다.'
      ],
      answer: 2,
      feedback: '유행이나 다수의 선택만 따르기보다, 본인이 납득할 수 있는 이유를 확인하려는 성향에 가깝습니다.'
    },
    {
      id: 'hard-quiz-v1-q8',
      question: '다음 중 사소한 TMI 두 가지를 모두 정확히 고른 것은?',
      options: [
        '최근 검색은 가성비 청소기 · 주로 작은 커피를 한 번에 마심',
        '최근 검색은 자동차 보험 · 집중할 때 완전한 무음을 선호',
        '최근 검색은 가성비 청소기 · 큰 커피를 옆에 두고 오래 조금씩 마심',
        '최근 검색은 피아노 구매 · 집중할 때 계속 울리는 알림을 선호'
      ],
      answer: 2,
      feedback: '최근에는 가성비 좋은 청소기를 찾아봤고, 커피는 큰 것 하나를 두고 오래 나눠 마시는 편입니다.'
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
      const rewardKey = item.id || quizIndex;
      if (!state.rewardedQuizQuestions.includes(rewardKey)) {
        state.rewardedQuizQuestions.push(rewardKey);
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
