// sistema-cupula.js

// 1. Configuração do Tailwind
tailwind.config = {
    corePlugins: {
        preflight: false, // Mantém o estilo original do Nicepage nas outras páginas
    }
}

// 2. Dados e Utilitários
const AVATARS = [
    { id: 'warrior', icon: 'sword', label: 'Guerreiro', color: 'text-red-500' },
    { id: 'king', icon: 'crown', label: 'Nobre', color: 'text-amber-500' },
    { id: 'mage', icon: 'gem', label: 'Mago', color: 'text-purple-500' },
    { id: 'rogue', icon: 'ghost', label: 'Ladino', color: 'text-emerald-500' },
    { id: 'guard', icon: 'shield', label: 'Guarda', color: 'text-blue-500' },
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

    // Lógica de Login (Firebase)
    React.useEffect(() => {
        if (window.firebaseAuth) {
            const auth = window.firebaseAuth.getAuth();
            const db = window.firebaseFirestore.getFirestore();
            
            window.firebaseAuth.onAuthStateChanged(auth, async (currentUser) => {
                if (currentUser) {
                    const ADMIN_EMAIL = "cupulasmp@gmail.com";
                    setIsAdmin(currentUser.email === ADMIN_EMAIL);
                    try {
                        const { doc, getDoc } = window.firebaseFirestore;
                        const userDoc = await getDoc(doc(db, 'artifacts', 'cupula-server-v1', 'users', currentUser.uid, 'profile', 'data'));
                        if (userDoc.exists()) setUser({ ...currentUser, ...userDoc.data() });
                        else setUser(currentUser);
                    } catch (e) { setUser(currentUser); }
                } else {
                    setUser(null);
                }
            });
        }
    }, []);

    const handleLogout = () => {
        if (window.confirm("Tem certeza que deseja desconectar?")) {
            window.firebaseAuth.signOut(window.firebaseAuth.getAuth()).then(() => window.location.reload());
        }
    };

    const getAvatarInfo = (id) => AVATARS.find(a => a.id === id) || AVATARS[0];

    // Item do Menu (Link)
    // ADICIONEI 'no-underline' AQUI PARA REMOVER O GRIFE
    const LinkItem = ({ href, icon, label, isActive }) => (
        <a href={href} className={`${isActive ? 'text-[#F1AE0E] font-bold border-b-2 border-[#F1AE0E]' : 'text-slate-300 hover:text-[#F1AE0E] font-medium'} no-underline transition flex items-center gap-2 text-sm uppercase tracking-wide pb-0.5`}>
            <Icon name={icon} className="w-4 h-4" /> {label}
        </a>
    );

    return (
        <nav className="bg-[#2B2933] backdrop-blur-md sticky top-0 z-50 border-b border-white/5 shadow-lg font-montserrat w-full">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <a href="./" className="flex items-center gap-2 group no-underline">
                         {!logoError ? (
                            <img src="images/logoACupula.png" alt="A Cúpula" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" onError={() => setLogoError(true)} />
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
                    <LinkItem href="Ajude-nos.html" icon="heart-handshake" label="Ajude-nos" isActive={currentPage === 'ajudenos'} />
                    <LinkItem href="Servidor.html" icon="server" label="Servidor" isActive={currentPage === 'servidor'} />
                </div>

                {/* Área do Usuário */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3 bg-white/5 pl-3 pr-1 py-1 rounded-full border border-white/10">
                            <div className="hidden md:block text-right">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-none mb-0.5">{user.avatarId ? getAvatarInfo(user.avatarId).label : 'Membro'}</p>
                                <p className={`text-xs font-bold leading-none ${isAdmin ? 'text-red-500' : 'text-[#F1AE0E]'}`}>
                                    {isAdmin ? 'ADMIN' : (user.name || user.displayName || 'Heroi').split(' ')[0]}
                                </p>
                            </div>
                            <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center ${isAdmin ? 'border border-red-500' : 'border border-[#F1AE0E]/30'}`}>
                                <Icon name={user.avatarId ? getAvatarInfo(user.avatarId).icon : 'user'} className={`w-4 h-4 ${user.avatarId ? getAvatarInfo(user.avatarId).color : 'text-white'}`} />
                            </div>
                            <button onClick={handleLogout} className="w-8 h-8 flex items-center justify-center hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-400 transition">
                                <Icon name="log-out" className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        // Botão Entrar/Membro (Com no-underline e cor dourada)
                        <a href="Ajude-nos.html" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-[#F1AE0E] rounded-full font-bold shadow-lg flex items-center gap-2 transition uppercase text-xs tracking-wide no-underline">
                            Área do Membro
                        </a>
                    )}
                    
                    {/* Mobile Button */}
                    <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Icon name={isMobileMenuOpen ? "x" : "menu"} className="w-6 h-6" />
                    </button>
                </div>
            </div>

             {/* Mobile Menu Dropdown */}
             {isMobileMenuOpen && (
                <div className="md:hidden bg-[#2B2933] border-b border-white/5 p-4 space-y-4">
                    <a href="./" className="block text-slate-300 hover:text-[#F1AE0E] font-medium py-2 no-underline">Home</a>
                    <a href="Ajude-nos.html" className="block text-[#F1AE0E] font-bold py-2 no-underline">Ajude-nos</a>
                    <a href="Servidor.html" className="block text-slate-300 hover:text-[#F1AE0E] font-medium py-2 no-underline">Servidor</a>
                </div>
            )}
        </nav>
    );
};

// 4. Componente Footer Compartilhado
const Footer = () => (
    <footer className="bg-[#2B2933] py-8 border-t border-white/5 w-full mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm font-montserrat">
                © 2025 A Cúpula SMP. Todos os direitos reservados à Cúpula.
            </p>
        </div>
    </footer>
);

// 5. Função de Inicialização
window.renderSharedComponents = (pageName) => {
    const headerRoot = document.getElementById('shared-header');
    const footerRoot = document.getElementById('shared-footer');

    if (headerRoot) {
        ReactDOM.createRoot(headerRoot).render(React.createElement(Navbar, { currentPage: pageName }));
    }
    if (footerRoot) {
        ReactDOM.createRoot(footerRoot).render(React.createElement(Footer));
    }
};