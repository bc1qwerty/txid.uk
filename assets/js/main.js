// ── Theme Toggle ──
var THEME_COLORS = { dark: '#09090b', light: '#fafafa' };
var themeToggle = document.getElementById('themeToggle');
var html = document.documentElement;

// 시스템 설정 감지 (prefers-color-scheme 지원)
var savedTheme = localStorage.getItem('theme');
if (savedTheme !== 'dark' && savedTheme !== 'light') {
    savedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
html.setAttribute('data-theme', savedTheme);
(function() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLORS[savedTheme];
})();

if (themeToggle) themeToggle.addEventListener('click', function() {
    document.body.classList.add('theme-transition');
    var current = html.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLORS[next];
    setTimeout(function() {
        document.body.classList.remove('theme-transition');
    }, 400);
});

// ── Throttle Utility ──
function throttle(fn, delay) {
    var last = 0;
    return function() {
        var now = Date.now();
        if (now - last >= delay) {
            last = now;
            fn.apply(this, arguments);
        }
    };
}

// ── Sidebar Toggle (Left + Right) ──
(function() {
    var overlay = document.getElementById('sidebarOverlay');
    var isDesktop = function() { return window.innerWidth >= 1200; };

    // --- Left Sidebar ---
    var leftToggle = document.getElementById('sidebarToggle');
    var leftColumn = document.getElementById('sidebarColumn');

    function setLeft(collapsed) {
        if (!leftColumn) return;
        if (collapsed) {
            leftColumn.classList.add('collapsed');
            document.body.classList.add('sidebar-collapsed');
        } else {
            leftColumn.classList.remove('collapsed');
            document.body.classList.remove('sidebar-collapsed');
        }
        if (leftToggle) leftToggle.setAttribute('aria-expanded', String(!collapsed));
    }

    // --- Right Sidebar ---
    var rightToggle = document.getElementById('sidebarRightToggle');
    var rightColumn = document.getElementById('sidebarRightColumn');

    function setRight(collapsed) {
        if (!rightColumn) return;
        if (collapsed) {
            rightColumn.classList.add('collapsed');
            document.body.classList.add('sidebar-right-collapsed');
        } else {
            rightColumn.classList.remove('collapsed');
            document.body.classList.remove('sidebar-right-collapsed');
        }
        if (rightToggle) rightToggle.setAttribute('aria-expanded', String(!collapsed));
    }

    // --- Close any open mobile sidebar ---
    function closeMobileSidebars() {
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // --- Init states ---
    var savedLeft = localStorage.getItem('sidebar-state');
    var savedRight = localStorage.getItem('sidebar-right-state');
    if (isDesktop()) {
        setLeft(savedLeft !== 'open');
        setRight(savedRight !== 'open');
    } else {
        setLeft(true);
        setRight(true);
    }

    // --- Avatar click ---
    var avatar = document.getElementById('sidebarAvatar');
    var avatarOverlay = document.getElementById('avatarOverlay');
    if (avatar && leftColumn) {
        avatar.addEventListener('click', function() {
            if (leftColumn.classList.contains('collapsed')) {
                setLeft(false);
                if (isDesktop()) {
                    localStorage.setItem('sidebar-state', 'open');
                } else {
                    if (overlay) overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            } else if (avatarOverlay) {
                avatarOverlay.classList.add('active');
                avatar.setAttribute('aria-expanded', 'true');
            }
        });
    }
    if (avatar) {
        avatar.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                avatar.click();
            }
        });
    }
    if (avatarOverlay) {
        avatarOverlay.addEventListener('click', function() {
            avatarOverlay.classList.remove('active');
            if (avatar) avatar.setAttribute('aria-expanded', 'false');
        });
    }

    // --- Left toggle click ---
    if (leftToggle && leftColumn) {
        leftToggle.addEventListener('click', function() {
            var wasCollapsed = leftColumn.classList.contains('collapsed');
            setLeft(!wasCollapsed);
            if (isDesktop()) {
                localStorage.setItem('sidebar-state', wasCollapsed ? 'open' : 'collapsed');
            } else {
                if (wasCollapsed) {
                    if (overlay) overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else {
                    closeMobileSidebars();
                }
            }
        });
    }

    // --- Right toggle click ---
    if (rightToggle && rightColumn) {
        rightToggle.addEventListener('click', function() {
            var wasCollapsed = rightColumn.classList.contains('collapsed');
            setRight(!wasCollapsed);
            if (isDesktop()) {
                localStorage.setItem('sidebar-right-state', wasCollapsed ? 'open' : 'collapsed');
            } else {
                if (wasCollapsed) {
                    if (overlay) overlay.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else {
                    closeMobileSidebars();
                }
            }
        });
    }

    // --- Overlay click closes both ---
    if (overlay) {
        overlay.addEventListener('click', function() {
            if (leftColumn && !leftColumn.classList.contains('collapsed') && !isDesktop()) {
                setLeft(true);
            }
            if (rightColumn && !rightColumn.classList.contains('collapsed') && !isDesktop()) {
                setRight(true);
            }
            closeMobileSidebars();
        });
    }

    // --- Escape closes mobile sidebars ---
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !isDesktop()) {
            var changed = false;
            if (leftColumn && !leftColumn.classList.contains('collapsed')) {
                setLeft(true); changed = true;
            }
            if (rightColumn && !rightColumn.classList.contains('collapsed')) {
                setRight(true); changed = true;
            }
            if (changed) closeMobileSidebars();
        }
    });

    // --- Resize: collapse mobile sidebars ---
    window.addEventListener('resize', throttle(function() {
        if (!isDesktop()) {
            var changed = false;
            if (leftColumn && !leftColumn.classList.contains('collapsed')) {
                setLeft(true); changed = true;
            }
            if (rightColumn && !rightColumn.classList.contains('collapsed')) {
                setRight(true); changed = true;
            }
            if (changed) closeMobileSidebars();
        }
    }, 150));
})();

// ── Intersection Observer — Fade In on Scroll ──
var fadeSections = document.querySelectorAll('.fade-section');
var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
fadeSections.forEach(function(section) { observer.observe(section); });

// ── Command Palette ──
(function() {
    var overlay = document.getElementById('cmdPalette');
    var input = document.getElementById('cmdInput');
    var results = document.getElementById('cmdResults');
    if (!overlay || !input || !results) return;

    var items = [];
    try {
        var raw = JSON.parse(document.getElementById('site-data').textContent);
        items = [].concat(raw.projects || [], raw.links || [], raw.social || [], raw.posts || [], raw.books || [], raw.stack || [], raw.bookmarks || [], raw.ideas || [], raw.pages || []);
    } catch(e) { return; }

    var activeIndex = 0;
    var filtered = [];
    var previousFocus = null;

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function open() {
        previousFocus = document.activeElement;
        overlay.hidden = false;
        input.value = '';
        search('');
        input.focus();
        document.body.style.overflow = 'hidden';
    }

    function close() {
        overlay.hidden = true;
        document.body.style.overflow = '';
        if (previousFocus) previousFocus.focus();
    }

    function search(query) {
        var q = query.toLowerCase().trim();
        filtered = q ? items.filter(function(i) { return (i.name && i.name.toLowerCase().includes(q)) || (i.author && i.author.toLowerCase().includes(q)); }) : items;
        activeIndex = 0;
        render();
    }

    var typeLabels = { project: '프로젝트', link: '링크', social: '소셜', post: '블로그', book: '도서', stack: '도구', bookmark: '북마크', idea: '개념', page: '페이지', learn: '공부방' };

    function render() {
        var html = '';
        if (filtered.length === 0) {
            html = '<div class="cmd-empty" role="status">검색 결과가 없습니다</div>';
        } else {
            var lastType = '';
            filtered.forEach(function(item, i) {
                if (item.type !== lastType) {
                    lastType = item.type;
                    html += '<div class="cmd-group-header">' + escapeHtml(typeLabels[item.type] || item.type) + '</div>';
                }
                html += '<a href="' + escapeHtml(item.url || '#') + '" class="cmd-result' + (i === activeIndex ? ' active' : '') + '" data-index="' + i + '" role="option"' + (i === activeIndex ? ' aria-selected="true"' : '') + '>' +
                    '<span class="cmd-result-name">' + escapeHtml(item.name) + '</span>' +
                    '<span class="cmd-result-type">' + escapeHtml(typeLabels[item.type] || item.type) + '</span>' +
                    '</a>';
            });
        }
        results.innerHTML = html;
    }

    function navigate(dir) {
        if (filtered.length === 0) return;
        activeIndex = (activeIndex + dir + filtered.length) % filtered.length;
        render();
        var el = results.querySelector('.active');
        if (el) {
            el.scrollIntoView({ block: 'nearest' });
            el.focus();
        }
    }

    function go() {
        var target = filtered[activeIndex];
        if (target && target.url) {
            window.location.href = target.url;
        }
    }

    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            overlay.hidden ? open() : close();
        }
        if (!overlay.hidden) {
            if (e.key === 'Escape') { close(); }
            if (e.key === 'ArrowDown') { e.preventDefault(); navigate(1); }
            if (e.key === 'ArrowUp') { e.preventDefault(); navigate(-1); }
            if (e.key === 'Enter') { e.preventDefault(); go(); }
            if (e.key === 'Tab') { e.preventDefault(); input.focus(); }
        }
    });

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) close();
    });

    input.addEventListener('input', function() { search(input.value); });

    results.addEventListener('mousemove', function(e) {
        var item = e.target.closest('.cmd-result');
        if (item) {
            var newIndex = parseInt(item.dataset.index, 10);
            if (newIndex !== activeIndex) {
                activeIndex = newIndex;
                render();
            }
        }
    });

    // ── Header / Mobile Search Buttons ──
    var headerSearchBtn = document.getElementById('headerSearchBtn');
    if (headerSearchBtn) headerSearchBtn.addEventListener('click', open);
    var mobileSearchBtn = document.getElementById('mobileSearchBtn');
    if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', open);
})();

// ── Project Uptime Ping ──
(function() {
    document.querySelectorAll('.tile-item[data-ping-url]').forEach(function(el) {
        var url = el.dataset.pingUrl;
        var dot = el.querySelector('.status-dot');
        if (!dot || !url) return;
        var controller = new AbortController();
        var timer = setTimeout(function() { controller.abort(); }, 5000);
        fetch(url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
            .then(function() {
                clearTimeout(timer);
                dot.classList.add('status-dot-live');
            })
            .catch(function() {
                clearTimeout(timer);
                dot.classList.remove('status-dot-live');
                dot.style.background = 'var(--color-red-500, #ef4444)';
                dot.style.animation = 'none';
            });
    });
})();

// ── Book Grid Shuffle & Toggle ──
(function() {
    var grid = document.getElementById('bookGrid');
    var toggle = document.getElementById('bookToggle');
    if (!grid) return;

    var cards = Array.from(grid.children);
    for (var i = cards.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = cards[i];
        cards[i] = cards[j];
        cards[j] = temp;
    }
    cards.forEach(function(card) { grid.appendChild(card); });

    if (!toggle) return;
    toggle.addEventListener('click', function() {
        var expanded = grid.classList.toggle('expanded');
        toggle.setAttribute('aria-expanded', String(expanded));
        toggle.textContent = expanded ? '접기 \u25B2' : '전체 보기 \u25BC';
    });
})();

// ── Clock Helper ──
function initClock(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var tz = el.dataset.tz || 'Asia/Seoul';
    function update() {
        try {
            el.textContent = new Date().toLocaleTimeString('en-GB', {
                timeZone: tz, hour: '2-digit', minute: '2-digit'
            });
        } catch(e) {
            el.textContent = new Date().toLocaleTimeString('en-GB', {
                timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit'
            });
        }
    }
    update();
    setInterval(update, 30000);
}
initClock('sidebarClock');


// ── Mobile Theme Toggle ──
(function() {
    var mobileToggle = document.getElementById('mobileThemeToggle');
    if (!mobileToggle) return;
    mobileToggle.addEventListener('click', function() {
        document.body.classList.add('theme-transition');
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = THEME_COLORS[next];
        setTimeout(function() {
            document.body.classList.remove('theme-transition');
        }, 400);
    });
})();



// ── Hero Nav Anchor Smooth Scroll ──
(function() {
    var heroNav = document.querySelector('.hero-nav');
    if (!heroNav) return;
    heroNav.querySelectorAll('a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            var target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
})();

// ── Scroll to Top ──
(function() {
    var btn = document.getElementById('scrollTop');
    if (!btn) return;
    window.addEventListener('scroll', throttle(function() {
        btn.classList.toggle('visible', window.scrollY > 400);
    }, 100));
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();

// ── Scroll Progress Bar ──
(function() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;
    window.addEventListener('scroll', throttle(function() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = h > 0 ? (window.scrollY / h * 100) + '%' : '0';
    }, 50));
})();

// ── Visitor Counter (GoatCounter) ──
(function() {
    var el = document.getElementById('visitorTotal');
    if (!el) return;
    var p = encodeURIComponent(location.pathname);
    var proxy = 'https://gc-proxy.seowondeuk.workers.dev/api/gc/' + p + '.json';
    var direct = 'https://txid.goatcounter.com/counter/' + p + '.json';
    function update(d) { if (d.count_unique || d.count) el.textContent = d.count_unique || d.count; }
    fetch(proxy)
        .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
        .then(update)
        .catch(function() {
            fetch(direct)
                .then(function(r) { return r.ok ? r.json() : Promise.reject(); })
                .then(update)
                .catch(function() {});
        });
})();

// ── Quote Rotation ──
(function() {
    var dataEl = document.getElementById('quote-data');
    var textEl = document.getElementById('quoteText');
    var authorEl = document.getElementById('quoteAuthor');
    if (!dataEl || !textEl || !authorEl) return;
    try {
        var quotes = JSON.parse(dataEl.textContent);
        if (quotes.length === 0) return;
        var idx = Math.floor(Math.random() * quotes.length);
        textEl.textContent = quotes[idx].text;
        authorEl.textContent = quotes[idx].author;
    } catch(e) { /* silent */ }
})();

// ── Bitcoin Widget ──
(function() {
    var priceEl = document.getElementById('btcPrice');
    var blockEl = document.getElementById('btcBlock');
    if (!priceEl && !blockEl) return;

    if (priceEl) {
        var ctrl1 = new AbortController();
        var t1 = setTimeout(function() { ctrl1.abort(); }, 5000);
        fetch('https://mempool.space/api/v1/prices', { signal: ctrl1.signal })
            .then(function(r) { clearTimeout(t1); if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(function(data) {
                if (data && typeof data.USD === 'number') {
                    priceEl.textContent = '$' + data.USD.toLocaleString();
                }
            })
            .catch(function() { clearTimeout(t1); });
    }

    if (blockEl) {
        var ctrl2 = new AbortController();
        var t2 = setTimeout(function() { ctrl2.abort(); }, 5000);
        fetch('https://mempool.space/api/blocks/tip/height', { signal: ctrl2.signal })
            .then(function(r) { clearTimeout(t2); if (!r.ok) throw new Error(r.status); return r.text(); })
            .then(function(height) {
                if (height && !isNaN(height)) {
                    blockEl.textContent = parseInt(height).toLocaleString();
                }
            })
            .catch(function() { clearTimeout(t2); });
    }
})();

// ── Idea/Concept Tag Filter ──
(function() {
    var filterContainer = document.getElementById('tagFilter');
    var listContainer = document.getElementById('conceptList');
    if (!filterContainer || !listContainer) return;

    var chips = filterContainer.querySelectorAll('.tag-chip');
    var cards = listContainer.querySelectorAll('.post-card');

    filterContainer.addEventListener('click', function(e) {
        var chip = e.target.closest('.tag-chip');
        if (!chip) return;
        var tag = chip.dataset.tag;
        chips.forEach(function(c) { c.classList.remove('tag-chip-active'); });
        chip.classList.add('tag-chip-active');
        cards.forEach(function(card) {
            if (tag === 'all') {
                card.style.display = '';
                return;
            }
            var cardTags = (card.dataset.tags || '').split(',');
            card.style.display = cardTags.indexOf(tag) !== -1 ? '' : 'none';
        });
    });
})();

// ── Mobile Menu Toggle ──
document.addEventListener('DOMContentLoaded', function() {
    var toggle = document.getElementById('menu-toggle');
    var menu = document.getElementById('mobile-menu');
    var backdrop = document.getElementById('mobile-menu-backdrop');
    var iconOpen = document.getElementById('menu-icon-open');
    var iconClose = document.getElementById('menu-icon-close');
    if (!toggle || !menu) return;

    function closeMenu() {
        menu.classList.add('hidden');
        if (backdrop) backdrop.classList.add('hidden');
        if (iconOpen) iconOpen.classList.remove('hidden');
        if (iconClose) iconClose.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
    }

    function openMenu() {
        menu.classList.remove('hidden');
        if (backdrop) backdrop.classList.remove('hidden');
        if (iconOpen) iconOpen.classList.add('hidden');
        if (iconClose) iconClose.classList.remove('hidden');
        toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function() {
        menu.classList.contains('hidden') ? openMenu() : closeMenu();
    });

    if (backdrop) backdrop.addEventListener('click', closeMenu);

    // 메뉴 링크 클릭 시 자동 닫기
    menu.addEventListener('click', function(e) {
        if (e.target.closest('a[href]')) closeMenu();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
            closeMenu();
            toggle.focus();
        }
    });
});

// ── Concept Popover ──
(function() {
    var active = null; // { el, popover }

    function esc(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function close() {
        if (!active) return;
        active.popover.remove();
        active = null;
    }

    function open(link) {
        close();
        var title = link.dataset.conceptTitle;
        var desc = link.dataset.conceptDesc;
        if (!title || !desc) return;

        var pop = document.createElement('div');
        pop.className = 'concept-popover';
        pop.innerHTML =
            '<button class="concept-popover-close" aria-label="닫기">&times;</button>' +
            '<div class="concept-popover-title">' + esc(title) + '</div>' +
            '<div class="concept-popover-desc">' + esc(desc) + '</div>' +
            '<a class="concept-popover-link" href="' + link.href + '">자세히 보기 &rarr;</a>';

        pop.querySelector('.concept-popover-close').addEventListener('click', function(e) {
            e.stopPropagation();
            close();
        });

        document.body.appendChild(pop);

        // 위치 계산
        var rect = link.getBoundingClientRect();
        var scrollY = window.scrollY;
        var scrollX = window.scrollX;
        var top = rect.bottom + scrollY + 6;
        var left = rect.left + scrollX;

        // 오른쪽 넘침 방지
        var popW = pop.offsetWidth;
        if (left + popW > window.innerWidth - 16) {
            left = window.innerWidth - popW - 16 + scrollX;
        }
        if (left < 16) left = 16;

        // 아래쪽 넘침 시 위로 표시
        var popH = pop.offsetHeight;
        if (rect.bottom + popH + 6 > window.innerHeight) {
            top = rect.top + scrollY - popH - 6;
        }

        pop.style.top = top + 'px';
        pop.style.left = left + 'px';

        active = { el: link, popover: pop };
    }

    // 이벤트 위임: data-concept-title 가진 링크 클릭
    document.addEventListener('click', function(e) {
        var link = e.target.closest('a[data-concept-title]');
        if (link) {
            e.preventDefault();
            if (active && active.el === link) {
                close();
            } else {
                open(link);
            }
            return;
        }
        // 팝오버 외부 클릭 시 닫기
        if (active && !e.target.closest('.concept-popover')) {
            close();
        }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') close();
    });
})();
