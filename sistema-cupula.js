// sistema-cupula.js

// 1. Configuração do Tailwind
tailwind.config = {
    corePlugins: {
        preflight: true, // Mantém o estilo original do Nicepage nas outras páginas
    },
    theme: {
        extend: {
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
            }
        }
    }
}

// 2. Dados e Utilitários
const AVATARS = [
            { id: 'villager', icon: 'user', label: 'Aldeão', color: 'text-emerald-600' },
            { id: 'king', icon: 'crown', label: 'Nobre', color: 'text-amber-500' },
            { id: 'mage', icon: 'wand-2', label: 'Mago', color: 'text-purple-500' },
            { id: 'rogue', icon: 'ghost', label: 'Ladino', color: 'text-emerald-500' },
            { id: 'archer', icon: 'target', label: 'Arqueiro', color: 'text-lime-500' },
            { id: 'barbarian', icon: 'axe', label: 'Bárbaro', color: 'text-orange-500' },
            { id: 'cleric', icon: 'heart-pulse', label: 'Clérigo', color: 'text-pink-500' },
            { id: 'druid', icon: 'leaf', label: 'Druida', color: 'text-green-500' },
            { id: 'paladin', icon: 'shield-check', label: 'Paladino', color: 'text-sky-500' },
            { id: 'blacksmith', icon: 'hammer', label: 'Ferreiro', color: 'text-gray-400' },
            { id: 'bard', icon: 'music', label: 'Bardo', color: 'text-yellow-300' },
            { id: 'merchant', icon: 'coins', label: 'Mercador', color: 'text-yellow-600' },
            { id: 'alchemist', icon: 'flask-conical', label: 'Alquimista', color: 'text-teal-400' },
            { id: 'hunter', icon: 'crosshair', label: 'Caçador', color: 'text-green-700' },
            { id: 'assassin', icon: 'sword', label: 'Assassino', color: 'text-slate-800' },
            { id: 'monk', icon: 'hand', label: 'Monge', color: 'text-orange-300' },
            { id: 'warlock', icon: 'flame', label: 'Bruxo', color: 'text-purple-800' },
            { id: 'necromancer', icon: 'skull', label: 'Necromante', color: 'text-zinc-500' },
            { id: 'explorer', icon: 'compass', label: 'Explorador', color: 'text-blue-400' },
            { id: 'miner', icon: 'pickaxe', label: 'Minerador', color: 'text-stone-400' },
            { id: 'builder', icon: 'hammer', label: 'Construtor', color: 'text-yellow-700' },
            { id: 'engineer', icon: 'wrench', label: 'Engenheiro', color: 'text-red-400' },
            { id: 'farmer', icon: 'wheat', label: 'Fazendeiro', color: 'text-lime-600' },
            { id: 'chef', icon: 'utensils', label: 'Cozinheiro', color: 'text-white' },
            { id: 'pirate', icon: 'anchor', label: 'Pirata', color: 'text-blue-800' },
            { id: 'ninja', icon: 'wind', label: 'Ninja', color: 'text-black' },
            { id: 'samurai', icon: 'sword', label: 'Samurai', color: 'text-red-700' },
            { id: 'viking', icon: 'axe', label: 'Viking', color: 'text-blue-300' },
            { id: 'guard', icon: 'shield', label: 'Guarda', color: 'text-slate-500' },
            { id: 'warrior', icon: 'sword', label: 'Guerreiro', color: 'text-red-500' },
];

const Icon = ({ name, className }) => {
    const elementRef = React.useRef(null);
    React.useEffect(() => {
        if (window.lucide && elementRef.current) {
            elementRef.current.innerHTML = '';
            const i = document.createElement('i');
            i.setAttribute('data-lucide', name);
            if (className) i.className = className;
            elementRef.current.appendChild(i);
            window.lucide.createIcons({ root: elementRef.current });
        }
    }, [name, className]);
    return React.createElement('span', { ref: elementRef, style: { display: 'contents' } });
};

// 3. Componente Navbar Compartilhado
const Navbar = ({ currentPage }) => {
    const [user, setUser] = React.useState(null);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [logoError, setLogoError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    // Lógica de Login (Firebase)
    React.useEffect(() => {
        if (window.firebaseAuth && window.firebaseFirestore && window.firebaseFirestore.onSnapshot) {
            const auth = window.firebaseAuth.getAuth();
            const db = window.firebaseFirestore.getFirestore();
            let unsubscribeProfile = () => {}; 
            
            const unsubscribeAuth = window.firebaseAuth.onAuthStateChanged(auth, (currentUser) => {
                unsubscribeProfile(); 
                if (currentUser) {
                    const ADMIN_EMAIL = "cupulasmp@gmail.com";
                    setIsAdmin(currentUser.email === ADMIN_EMAIL);
                    
                    const { doc, onSnapshot, setDoc, serverTimestamp } = window.firebaseFirestore;
                    const userDocRef = doc(db, 'artifacts', 'cupula-server-v1', 'users', currentUser.uid, 'profile', 'data');

                    unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
                        if (docSnap.exists()) {
                            setUser({ ...currentUser, ...docSnap.data() });
                        } else {
                            // Perfil não existe. Cria um perfil padrão para garantir consistência.
                            // Isso acontece com usuários recém-registrados ou em caso de erro.
                            const defaultProfile = {
                                name: currentUser.displayName || 'Recruta',
                                minecraftNick: currentUser.displayName || 'Steve',
                                email: currentUser.email,
                                avatarId: 'villager',
                                role: 'user',
                                birthDate: '',
                                isOriginal: false,
                                createdAt: serverTimestamp()
                            };
                            // setDoc irá criar o documento. onSnapshot será acionado novamente com os novos dados.
                            setDoc(userDocRef, defaultProfile, { merge: true }).catch(err => {
                                console.error("Erro ao criar perfil padrão no cabeçalho:", err);
                            });
                        }
                        setIsLoading(false);
                    }, (error) => {
                        console.error("Erro ao buscar perfil no cabeçalho:", error);
                        setUser(currentUser); 
                        setIsLoading(false);
                    });

                } else {
                    setUser(null);
                    setIsAdmin(false);
                    setIsLoading(false);
                }
            });

            return () => {
                unsubscribeAuth();
                unsubscribeProfile();
            };
        }
    }, []);

    const handleLogout = () => {
        if (window.confirm("Tem certeza que deseja desconectar?")) {
            window.firebaseAuth.signOut(window.firebaseAuth.getAuth()).then(() => window.location.reload());
        }
    };

    const getAvatarInfo = (id) => AVATARS.find(a => a.id === id) || AVATARS[0];

    // Item do Menu (Link)
    const LinkItem = ({ href, icon, label, isActive }) => (
        <a href={href} className={`${isActive ? 'text-[#F1AE0E] font-bold border-b-2 border-[#F1AE0E]' : 'text-slate-300 hover:text-[#F1AE0E] font-medium'} no-underline transition flex items-center gap-2 text-sm uppercase tracking-wide pb-0.5`}>
            <Icon name={icon} className="w-4 h-4" /> {label}
        </a>
    );

    return (
        <nav className="bg-[#2B2933] backdrop-blur-md sticky top-0 z-50 border-b border-white/5 shadow-lg font-montserrat w-full">
            <div className="max-w-7xl mx-auto px-4 h-36 flex items-center justify-between">
                
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <a href="./" className="flex items-center gap-2 group no-underline">
                         {!logoError ? (
                            <img src="images/logoACupula.png" alt="A Cúpula" className="h-32 w-auto object-contain transition-transform group-hover:scale-105" onError={() => setLogoError(true)} />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Icon name="crown" className="w-8 h-8 text-[#F1AE0E]" />
                                <span className="font-bold text-xl tracking-wider text-[#F1AE0E] font-medieval">A CÚPULA</span>
                            </div>
                        )}
                    </a>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    <LinkItem href="./" icon="home" label="Home" isActive={currentPage === 'home'} />                    
                    <LinkItem href="Portal.html" icon="door-open" label="Portal" isActive={currentPage === 'portal'} />
                    <LinkItem href="Servidor.html" icon="server" label="Servidor" isActive={currentPage === 'servidor'} />
                    {user && <LinkItem href="meu-perfil.html" icon="settings" label="Meu Perfil" isActive={currentPage === 'perfil'} />}
                </div>

                {/* Área do Usuário */}
                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center px-4">
                            <Icon name="loader-2" className="w-5 h-5 text-[#F1AE0E] animate-spin" />
                        </div>
                    ) : user ? (
                        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 animate-fade-in">
                            <a href="meu-perfil.html" className="flex items-center gap-3 no-underline px-2 rounded-full hover:bg-white/10 transition-colors">
                                <div className="hidden md:block text-right">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-none mb-0.5">{user.avatarId ? getAvatarInfo(user.avatarId).label : 'Membro'}</p>
                                    <p className={`text-xs font-bold leading-none ${isAdmin ? 'text-red-500' : 'text-[#F1AE0E]'}`}>
                                        {isAdmin ? 'ADMIN' : (user.name || user.minecraftNick || user.displayName || 'Heroi').split(' ')[0]}
                                    </p>
                                </div>
                                <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center ${isAdmin ? 'border border-red-500' : 'border border-[#F1AE0E]/30'}`}>
                                    <Icon name={user.avatarId ? getAvatarInfo(user.avatarId).icon : 'user'} className={`w-4 h-4 ${user.avatarId ? getAvatarInfo(user.avatarId).color : 'text-white'}`} />
                                </div>
                            </a>
                            <button onClick={handleLogout} className="w-8 h-8 flex items-center justify-center hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-400 transition">
                                <Icon name="log-out" className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        // NOVOS BOTÕES: Login e Registro separados
                     <div className="flex flex-col items-end gap-1">
                         <a href="Portal.html?mode=login" className="text-slate-300 hover:text-white font-bold text-xs uppercase tracking-wide no-underline transition">
                                Login
                            </a>
                       <a href="Portal.html?mode=register" className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-[#F1AE0E] hover:text-[#F1AE0E] rounded-full font-bold shadow-lg flex items-center justify-center gap-2 transition uppercase text-xs tracking-wide no-underline">
                         Registrar
                      </a>
                     </div>
                    )}
                    
                    {/* Mobile Button - COR MUDADA AQUI */}
                    <button className="md:hidden text-[#F1AE0E]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Icon name={isMobileMenuOpen ? "x" : "menu"} className="w-6 h-6" />
                    </button>
                </div>
            </div>

             {/* Mobile Menu Dropdown */}
             {isMobileMenuOpen && (
                <div className="md:hidden bg-[#2B2933] border-b border-white/5 p-4 space-y-4">
                    <a href="./" className="block text-slate-300 hover:text-[#F1AE0E] font-medium py-2 no-underline">Home</a>
                    <a href="Portal.html" className="block text-[#F1AE0E] font-bold py-2 no-underline">Portal</a>
                    <a href="Servidor.html" className="block text-slate-300 hover:text-[#F1AE0E] font-medium py-2 no-underline">Servidor</a>
                    {user && <a href="meu-perfil.html" className="block text-slate-300 hover:text-[#F1AE0E] font-medium py-2 no-underline">Meu Perfil</a>}
                </div>
            )}
        </nav>
    );
};

// 4. Componente Footer Compartilhado
const Footer = () => (
    <footer className="bg-[#2B2933] py-8 border-t border-white/5 w-full mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-white text-sm font-montserrat">
                © 2025 A Cúpula SMP. Todos os direitos reservados à Cúpula.
            </p>
            <p className="text-slate-500 text-xs mt-2">
                <a href="termos.html" className="hover:text-slate-300 transition no-underline">Termos de Serviço e Privacidade</a>
            </p>
        </div>
    </footer>
);

// 5. Função de Inicialização

const fetchAndDisplayServerIp = () => {
    const ipElement = document.getElementById('server-ip-display');
    if (!ipElement) return; // Se o elemento não existir na página, não faz nada.

    // Espera o Firebase estar pronto
    const waitForFirebase = setInterval(() => {
        if (window.firebaseFirestore && window.firebaseApp && window.firebaseAuth) {
            clearInterval(waitForFirebase);
            
            const { getFirestore, doc, getDoc } = window.firebaseFirestore;
            const { getAuth, onAuthStateChanged } = window.firebaseAuth;
            const db = getFirestore(window.firebaseApp);
            const auth = getAuth(window.firebaseApp);
            
            // Verifica autenticação e status de quarentena
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                unsubscribe(); // Executa apenas uma vez
                
                let isQuarantined = false;
                if (user) {
                    try {
                        const userDocRef = doc(db, 'artifacts', 'cupula-server-v1', 'users', user.uid, 'profile', 'data');
                        const userSnap = await getDoc(userDocRef);
                        if (userSnap.exists() && userSnap.data().status === 'quarantined') {
                            isQuarantined = true;
                        }
                    } catch (e) { console.error("Erro ao verificar quarentena:", e); }
                }

                const settingsRef = doc(db, 'artifacts', 'cupula-server-v1', 'public', 'settings');
                
                getDoc(settingsRef).then(docSnap => {
                    const data = docSnap.exists() ? docSnap.data() : {};
                    const isOnline = typeof data.isServerOnline === 'boolean' ? data.isServerOnline : true;
                    const serverIp = data.serverIp || 'jogar.acupula.com.br';

                    if (isQuarantined) {
                        ipElement.innerText = 'Bloqueado (Quarentena)';
                        ipElement.style.color = '#f87171';
                        ipElement.style.cursor = 'not-allowed';
                        ipElement.title = 'Acesso restrito';
                        ipElement.onclick = (e) => { e.preventDefault(); alert('Você está em quarentena.'); };
                    } else if (isOnline) {
                        ipElement.innerText = serverIp;
                        ipElement.style.color = '#fbbf24'; // Cor original (âmbar)
                        ipElement.style.cursor = 'pointer';
                        ipElement.title = 'Clique para copiar';
                        ipElement.onclick = () => {
                            navigator.clipboard.writeText(ipElement.innerText);
                            alert('IP Copiado!');
                        };
                    } else {
                        ipElement.innerText = 'Servidor em manutenção.';
                        ipElement.style.color = '#f87171'; // Cor vermelha para offline
                        ipElement.style.cursor = 'not-allowed';
                        ipElement.title = 'O servidor está offline';
                        ipElement.onclick = null; // Desativa o clique
                    }
                }).catch(error => {
                    console.error("Erro ao buscar informações do servidor: ", error);
                    ipElement.innerText = 'Erro ao carregar status';
                    ipElement.style.color = '#f87171';
                    ipElement.style.cursor = 'not-allowed';
                });
            });
        }
    }, 100);
};


window.renderSharedComponents = (pageName) => {
    const headerRoot = document.getElementById('shared-header');
    const footerRoot = document.getElementById('shared-footer');

    if (headerRoot) {
        ReactDOM.createRoot(headerRoot).render(React.createElement(Navbar, { currentPage: pageName }));
    }
    if (footerRoot) {
        ReactDOM.createRoot(footerRoot).render(React.createElement(Footer));
    }
    fetchAndDisplayServerIp();
};

// Lógica de Execução Robusta (Corrige Race Conditions e garante renderização)
// 1. Processa callbacks que já estavam na fila esperando o script carregar
const existingQueue = window.onSharedComponentsReady || [];
if (Array.isArray(existingQueue)) {
    existingQueue.forEach(cb => {
        try { cb(); } catch(e) { console.error("Erro ao renderizar componente (fila):", e); }
    });
}

// 2. Substitui o array por um objeto que executa imediatamente qualquer novo pedido
window.onSharedComponentsReady = {
    push: (cb) => {
        try { cb(); } catch(e) { console.error("Erro ao renderizar componente (imediato):", e); }
    }
};