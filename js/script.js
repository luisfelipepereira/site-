(() => {
    const root = document.documentElement;
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const storage = {
        get(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (error) {
                return fallback;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                // Ignore storage errors (private mode, quota, etc.)
            }
        }
    };

    const loader = $('#loader');
    window.addEventListener('load', () => {
        if (loader) {
            setTimeout(() => loader.classList.add('is-hidden'), 200);
        }
    });

    const menuToggle = $('#menuToggle');
    const navMenu = $('#siteNav');
    const closeMenu = () => {
        if (!navMenu || !menuToggle) return;
        navMenu.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('is-open');
            const expanded = navMenu.classList.contains('is-open');
            menuToggle.setAttribute('aria-expanded', expanded.toString());
        });

        $$('.nav-menu a').forEach((link) => link.addEventListener('click', closeMenu));

        document.addEventListener('click', (event) => {
            if (!navMenu.classList.contains('is-open')) return;
            if (navMenu.contains(event.target) || menuToggle.contains(event.target)) return;
            closeMenu();
        });
    }

    const themeToggle = $('#themeToggle');
    const themeLabel = $('#themeLabel');
    const themeIcon = $('#themeIcon');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const storedTheme = storage.get('theme', null);
    const initialTheme = storedTheme || root.dataset.theme || (prefersLight ? 'light' : 'dark');

    const setTheme = (theme) => {
        root.dataset.theme = theme;
        storage.set('theme', theme);
        const isLight = theme === 'light';
        if (themeLabel) themeLabel.textContent = isLight ? 'Claro' : 'Escuro';
        if (themeIcon) themeIcon.className = isLight ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    };

    setTheme(initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
            setTheme(nextTheme);
        });
    }

    const scrollProgress = $('#scrollProgress');
    const backToTop = $('#backToTop');

    const updateScrollProgress = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        if (scrollProgress) {
            scrollProgress.style.transform = `scaleX(${progress})`;
        }
        if (backToTop) {
            backToTop.classList.toggle('show', scrollTop > 420);
        }
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const cursorDot = $('#cursorDot');
    const cursorOutline = $('#cursorOutline');
    if (cursorDot && cursorOutline && window.matchMedia('(pointer: fine)').matches) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let outlineX = mouseX;
        let outlineY = mouseY;

        const render = () => {
            outlineX += (mouseX - outlineX) * 0.14;
            outlineY += (mouseY - outlineY) * 0.14;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;
            requestAnimationFrame(render);
        };

        document.addEventListener('mousemove', (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        render();
    }

    const parallaxItems = $$('[data-parallax]');
    if (parallaxItems.length) {
        document.addEventListener('mousemove', (event) => {
            const x = (event.clientX / window.innerWidth - 0.5) * 2;
            const y = (event.clientY / window.innerHeight - 0.5) * 2;
            parallaxItems.forEach((item) => {
                const speed = parseFloat(item.dataset.speed || '0.1');
                item.style.transform = `translate3d(${x * speed * 40}px, ${y * speed * 40}px, 0)`;
            });
        });
    }

    const animatedItems = $$('[data-animate]');
    if (animatedItems.length) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );

        animatedItems.forEach((item) => {
            const delay = item.dataset.animateDelay;
            if (delay) {
                item.style.setProperty('--delay', `${delay}ms`);
            }
            observer.observe(item);
        });
    }

    const typingEl = $('#typing');
    if (typingEl) {
        const text = 'Desenvolvedor Fullstack';
        let index = 0;
        const speed = 90;

        const type = () => {
            typingEl.textContent = text.slice(0, index);
            if (index < text.length) {
                index += 1;
                setTimeout(type, speed);
                return;
            }
            document.body.classList.add('typing-complete');
        };

        if (prefersReducedMotion) {
            typingEl.textContent = text;
            document.body.classList.add('typing-complete');
        } else {
            type();
        }
    }

    const framesScroll = document.querySelector('[data-frames-scroll]');
    if (framesScroll) {
        const track = framesScroll.querySelector('[data-frames-track]');
        const rail = framesScroll.querySelector('[data-frames-rail]');

        const updateFrames = () => {
            if (!track || !rail) return;
            const isMobile = window.matchMedia('(max-width: 980px)').matches;
            if (prefersReducedMotion || isMobile) {
                track.style.transform = '';
                return;
            }

            const rect = framesScroll.getBoundingClientRect();
            const totalScroll = framesScroll.offsetHeight - window.innerHeight;
            if (totalScroll <= 0) return;

            const progress = Math.min(Math.max(-rect.top, 0), totalScroll) / totalScroll;
            const maxTranslate = Math.max(track.scrollWidth - rail.clientWidth, 0);
            track.style.transform = `translate3d(${-maxTranslate * progress}px, 0, 0)`;
        };

        updateFrames();
        window.addEventListener('scroll', updateFrames, { passive: true });
        window.addEventListener('resize', updateFrames);
    }

    const availabilityToggle = $('#availabilityToggle');
    const availabilityLabel = $('#availabilityLabel');
    const availabilityStatus = $('#availabilityStatus');

    if (availabilityToggle && availabilityLabel && availabilityStatus) {
        let currentStatus = storage.get('availabilityStatus', 'available');

        const updateAvailability = () => {
            const isBusy = currentStatus === 'busy';
            availabilityStatus.textContent = isBusy ? 'Ocupado' : 'Disponível';
            availabilityLabel.textContent = isBusy ? 'Ocupado no momento' : 'Disponível para novos projetos';
            availabilityStatus.classList.toggle('is-busy', isBusy);
            availabilityToggle.classList.toggle('is-busy', isBusy);
            availabilityToggle.setAttribute('aria-pressed', isBusy ? 'true' : 'false');
            storage.set('availabilityStatus', currentStatus);
        };

        updateAvailability();

        availabilityToggle.addEventListener('click', () => {
            currentStatus = currentStatus === 'available' ? 'busy' : 'available';
            updateAvailability();
        });
    }

    const featuredProject = $('#featuredProject');
    if (featuredProject) {
        const featuredImage = $('#featuredImage');
        const featuredTitle = $('#featuredTitle');
        const featuredDescription = $('#featuredDescription');
        const featuredTags = $('#featuredTags');
        const featuredRepo = $('#featuredRepo');
        const featuredDemo = $('#featuredDemo');
        const featuredPrev = $('#featuredPrev');
        const featuredNext = $('#featuredNext');
        const featuredDots = $('#featuredDots');

        const cards = $$('.project-card');
        const projectData = cards.map((card) => {
            const title = card.querySelector('h3')?.textContent?.trim() || 'Projeto';
            const description = card.querySelector('p')?.textContent?.trim() || '';
            const image = card.querySelector('img')?.getAttribute('src') || '';
            const tags = $$('.project-tags li', card).map((tag) => tag.textContent.trim());
            const repoLink = card.querySelector('.project-actions a.ghost')?.getAttribute('href') || '#';
            const demoLink = card.querySelector('.project-actions a.primary')?.getAttribute('href') || '#';
            return {
                title,
                description,
                image,
                tags,
                repoLink,
                demoLink
            };
        });

        let currentIndex = 0;
        let timer;

        const renderFeatured = (index) => {
            const data = projectData[index];
            if (!data) return;
            if (featuredImage) {
                featuredImage.src = data.image;
                featuredImage.alt = `Preview do projeto ${data.title}`;
            }
            if (featuredTitle) featuredTitle.textContent = data.title;
            if (featuredDescription) featuredDescription.textContent = data.description;
            if (featuredRepo) featuredRepo.href = data.repoLink;
            if (featuredDemo) featuredDemo.href = data.demoLink;

            if (featuredTags) {
                featuredTags.innerHTML = '';
                data.tags.forEach((tag) => {
                    const li = document.createElement('li');
                    li.textContent = tag;
                    featuredTags.appendChild(li);
                });
            }

            if (featuredDots) {
                Array.from(featuredDots.children).forEach((dot, dotIndex) => {
                    dot.classList.toggle('is-active', dotIndex === index);
                    dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
                });
            }
        };

        const goTo = (index) => {
            currentIndex = index;
            renderFeatured(currentIndex);
        };

        const next = () => {
            const nextIndex = (currentIndex + 1) % projectData.length;
            goTo(nextIndex);
        };

        const prev = () => {
            const prevIndex = (currentIndex - 1 + projectData.length) % projectData.length;
            goTo(prevIndex);
        };

        const startAuto = () => {
            if (timer) clearInterval(timer);
            timer = setInterval(next, 8000);
        };

        if (featuredDots) {
            featuredDots.innerHTML = '';
            projectData.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'featured-dot';
                dot.setAttribute('aria-label', `Ver projeto ${index + 1}`);
                dot.addEventListener('click', () => {
                    goTo(index);
                    startAuto();
                });
                featuredDots.appendChild(dot);
            });
        }

        if (featuredNext) {
            featuredNext.addEventListener('click', () => {
                next();
                startAuto();
            });
        }

        if (featuredPrev) {
            featuredPrev.addEventListener('click', () => {
                prev();
                startAuto();
            });
        }

        if (projectData.length) {
            renderFeatured(0);
            if (projectData.length > 1) {
                startAuto();
            }
        }
    }

    const githubRepos = $('#githubRepos');
    if (githubRepos) {
        const username = githubRepos.dataset.username || 'luisfelipepereira';
        const endpoint = `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`;

        fetch(endpoint, {
            headers: {
                Accept: 'application/vnd.github+json'
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erro ao buscar repositórios');
                }
                return response.json();
            })
            .then((repos) => {
                const filtered = repos.filter((repo) => !repo.fork).slice(0, 6);
                githubRepos.innerHTML = '';
                filtered.forEach((repo) => {
                    const card = document.createElement('article');
                    card.className = 'repo-card';
                    card.innerHTML = `
                        <h3>${repo.name}</h3>
                        <p>${repo.description || 'Sem descrição no momento.'}</p>
                        <div class="repo-meta">
                            <span><i class="bi bi-star"></i> ${repo.stargazers_count}</span>
                            <span><i class="bi bi-diagram-2"></i> ${repo.forks_count}</span>
                            <span><i class="bi bi-code-slash"></i> ${repo.language || 'N/A'}</span>
                        </div>
                        <a class="btn btn-sm ghost" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">Ver no GitHub</a>
                    `;
                    githubRepos.appendChild(card);
                });
            })
            .catch(() => {
                githubRepos.innerHTML = '<p class="muted">Não foi possível carregar os repositórios agora.</p>';
            });
    }

    const viewCount = $('#viewCount');
    const projectClickCount = $('#projectClickCount');
    const topProjectName = $('#topProjectName');
    const topProjectCount = $('#topProjectCount');
    const topProjectsList = $('#topProjectsList');
    const adminMessages = $('#adminMessages');

    const visitKey = 'portfolio_visits';
    const clickKey = 'project_clicks';
    const messageKey = 'contact_messages';

    const today = new Date().toISOString().slice(0, 10);
    const visits = storage.get(visitKey, { total: 0, lastVisit: '' });
    if (visits.lastVisit !== today) {
        visits.total += 1;
        visits.lastVisit = today;
        storage.set(visitKey, visits);
    }

    const clickData = storage.get(clickKey, {});
    const projectNames = {};

    $$('.project-card').forEach((card) => {
        const title = card.querySelector('h3')?.textContent?.trim() || 'Projeto';
        const id = card.dataset.projectId || title.toLowerCase().replace(/\s+/g, '-');
        projectNames[id] = title;
        card.dataset.projectId = id;

        $$('.project-actions a', card).forEach((link) => {
            link.addEventListener('click', () => {
                clickData[id] = (clickData[id] || 0) + 1;
                storage.set(clickKey, clickData);
                updateAnalytics();
            });
        });
    });

    const updateAnalytics = () => {
        if (viewCount) viewCount.textContent = visits.total;

        const totalClicks = Object.values(clickData).reduce((sum, value) => sum + value, 0);
        if (projectClickCount) projectClickCount.textContent = totalClicks;

        const sorted = Object.entries(clickData).sort((a, b) => b[1] - a[1]);
        if (sorted.length) {
            const [topId, topCount] = sorted[0];
            if (topProjectName) topProjectName.textContent = projectNames[topId] || topId;
            if (topProjectCount) topProjectCount.textContent = `${topCount} cliques`;
        } else {
            if (topProjectName) topProjectName.textContent = '-';
            if (topProjectCount) topProjectCount.textContent = '0 cliques';
        }

        if (topProjectsList) {
            if (!sorted.length) {
                topProjectsList.innerHTML = '<p class="muted">Nenhum clique registrado ainda.</p>';
            } else {
                topProjectsList.innerHTML = '';
                sorted.slice(0, 3).forEach(([id, count], index) => {
                    const item = document.createElement('div');
                    item.className = 'top-project';
                    item.innerHTML = `
                        <span class="top-rank">#${index + 1}</span>
                        <span>${projectNames[id] || id}</span>
                        <span class="top-count">${count}</span>
                    `;
                    topProjectsList.appendChild(item);
                });
            }
        }

        if (adminMessages) {
            const messages = storage.get(messageKey, []);
            adminMessages.textContent = messages.length
                ? `Você tem ${messages.length} mensagem(s) salvas localmente.`
                : 'Nenhuma mensagem registrada localmente.';
        }
    };

    updateAnalytics();

    const currentYear = $('#currentYear');
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    const contactForm = $('#contactForm');
    const newsletterForm = $('#newsletterForm');

    const setStatus = (statusEl, message, isError = false) => {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.classList.toggle('is-error', isError);
    };

    const handleFormSubmit = async (form, fields, statusEl, storageKey, successMessage) => {
        const endpoint = form.dataset.endpoint?.trim();
        const submitButton = form.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.dataset.originalText = submitButton.textContent;
            submitButton.textContent = 'Enviando...';
        }

        if (!endpoint) {
            const items = storage.get(storageKey, []);
            items.push({ ...fields, createdAt: new Date().toISOString() });
            storage.set(storageKey, items);
            setStatus(statusEl, `${successMessage} Configure o endpoint para envio real.`);
            form.reset();
            updateAnalytics();
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.dataset.originalText || 'Enviar';
            }
            return;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fields)
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar');
            }

            setStatus(statusEl, successMessage);
            form.reset();
        } catch (error) {
            setStatus(statusEl, 'Não foi possível enviar agora. Tente novamente.', true);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = submitButton.dataset.originalText || 'Enviar';
            }
        }
    };

    if (contactForm) {
        const statusEl = $('#formStatus');
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(contactForm);
            const payload = {
                nome: formData.get('nome')?.toString().trim() || '',
                email: formData.get('email')?.toString().trim() || '',
                mensagem: formData.get('mensagem')?.toString().trim() || ''
            };

            if (!payload.nome || !payload.email || !payload.mensagem) {
                setStatus(statusEl, 'Preencha todos os campos obrigatórios.', true);
                return;
            }

            handleFormSubmit(contactForm, payload, statusEl, contactForm.dataset.storageKey || messageKey, 'Mensagem enviada com sucesso.');
        });
    }

    if (newsletterForm) {
        const statusEl = $('#newsletterStatus');
        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(newsletterForm);
            const payload = {
                email: formData.get('email')?.toString().trim() || ''
            };

            if (!payload.email) {
                setStatus(statusEl, 'Informe um email válido.', true);
                return;
            }

            handleFormSubmit(newsletterForm, payload, statusEl, newsletterForm.dataset.storageKey || 'newsletter_subscribers', 'Inscrição confirmada.');
        });
    }
})();
