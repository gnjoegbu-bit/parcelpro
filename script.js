// ========================================
// PARCEL PRO - MAIN JAVASCRIPT
// ========================================

// ========================================
// ADMIN AUTH DATA
// ========================================

function getAdminAuthData() {
    return {
        sessionId: getPresenceSessionId(),

        token:
            sessionStorage.getItem(
                "parcelProAdminPresenceToken"
            ) ||
            localStorage.getItem(
                "parcelProAdminPresenceToken"
            )
    };
}

// ========================================
// MOBILE MENU
// ========================================

function toggleMenu() {

    const navMenu =
        document.getElementById("navMenu");

    if (!navMenu) {

        console.error(
            "Parcel Pro: #navMenu was not found."
        );

        return;
    }

    navMenu.classList.toggle("active");

    const button =
        document.getElementById("menuToggle") ||
        document.getElementById("menuButton") ||
        document.querySelector(
            ".menu-toggle, .hamburger"
        );

    if (button) {

        button.setAttribute(
            "aria-expanded",
            navMenu.classList.contains("active")
                ? "true"
                : "false"
        );

    }

}

window.toggleMenu = toggleMenu;


// ========================================
// SETUP MOBILE MENU
// ========================================

function setupMobileMenu() {

    const navMenu =
        document.getElementById("navMenu");

    if (!navMenu) {
        return;
    }

    const button =
        document.getElementById("menuToggle") ||
        document.getElementById("menuButton") ||
        document.querySelector(
            ".menu-toggle, .hamburger"
        );

    if (
        button &&
        button.getAttribute("onclick") !==
            "toggleMenu()"
    ) {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                toggleMenu();

            }
        );

    }

    const links =
        navMenu.querySelectorAll("a");

    links.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    navMenu.classList.remove(
                        "active"
                    );

                    if (button) {

                        button.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }

                }
            );

        }
    );

}

// ========================================
// LANGUAGE SELECTOR
// ========================================

function setupLanguageSelector() {

    const languageSelect =
        document.getElementById("languageSelect");

    if (!languageSelect) {
        return;
    }

    const translations = {

        en: {
            Home: "Home",
            About: "About",
            Login: "Login",
        "Fast & Reliable Delivery":
            "Fast & Reliable Delivery",
    "We make sure your packages reach their destination safely and on time.":
        "We make sure your packages reach their destination safely and on time.",

    "Real-Time Tracking":
        "Real-Time Tracking",

    "Track your parcel and stay updated on its delivery progress from anywhere.":
        "Track your parcel and stay updated on its delivery progress from anywhere.",

    "Secure Package Handling":
        "Secure Package Handling",

    "Your packages are handled carefully from pickup to final delivery.":
        "Your packages are handled carefully from pickup to final delivery.",

    "Worldwide Shipping":
        "Worldwide Shipping",

    "Send packages across cities, countries, and international destinations.":
        "Send packages across cities, countries, and international destinations.",

    "Customer Support":
        "Customer Support",

"About ParcelPro": "About ParcelPro",
"ParcelPro is a modern parcel delivery and tracking service built to make shipping simple, reliable, and transparent. From the moment your package leaves the sender to the moment it reaches its destination, ParcelPro keeps you informed every step of the way.": "ParcelPro is a modern parcel delivery and tracking service built to make shipping simple, reliable, and transparent. From the moment your package leaves the sender to the moment it reaches its destination, ParcelPro keeps you informed every step of the way.",
"Reliable Delivery": "Reliable Delivery",
"We focus on safe and dependable parcel delivery.": "We focus on safe and dependable parcel delivery.",
"Real-Time Tracking": "Real-Time Tracking",
"Track your shipment and stay updated on its progress.": "Track your shipment and stay updated on its progress.",
"Secure Handling": "Secure Handling",
"Your parcels are handled with care from pickup to delivery.": "Your parcels are handled with care from pickup to delivery.",

    "Parcels Delivered": "Parcels Delivered",
       "Happy Customers": "Happy Customers",
       "Countries Covered": "Countries Covered",

    "Get help whenever you need it through our customer support team.":
        "Get help whenever you need it through our customer support team.",

    "Competitive Pricing":
        "Competitive Pricing",

    "Enjoy dependable shipping services at prices designed to give you great value.":
        "Enjoy dependable shipping services at prices designed to give you great value.",

    "We make shipping simple, secure, and reliable.":
        "We make shipping simple, secure, and reliable.",
            "Track Parcel": "Track Parcel",
            "Welcome to Parcel Pro": "Welcome to Parcel Pro",
            "Why Choose Parcel Pro?": "Why Choose Parcel Pro?",
            "Track Your Parcel": "Track Your Parcel",
            "Enter your tracking number below.":
                "Enter your tracking number below.",
            Track: "Track",
            "Shipment Found": "Shipment Found",
            "Your parcel is on its way":
                "Your parcel is on its way",
            "TRACKING NUMBER": "TRACKING NUMBER",
            "Shipment Confirmed": "Shipment Confirmed",
            "Your shipment has been created":
                "Your shipment has been created",
            "Picked Up": "Picked Up",
            "Parcel received for delivery":
                "Parcel received for delivery",
            "In Transit": "In Transit",
            "Out for Delivery": "Out for Delivery",
            "Your parcel is on the way to its destination":
                "Your parcel is on the way to its destination",
            Delivered: "Delivered",
            "Your parcel has been delivered":
                "Your parcel has been delivered",
            Completed: "Completed",
            "Awaiting this stage": "Awaiting this stage",
            CUSTOMER: "CUSTOMER",
            DESTINATION: "DESTINATION",
            Pending: "Pending",
            Preparing: "Preparing",
            "Shipment not found": "Shipment not found",
            "Please check your tracking number and try again.":
                "Please check your tracking number and try again.",
            "Please enter a tracking number.":
                "Please enter a tracking number.",
            "Searching for your parcel...":
                "Searching for your parcel...",
                "Parcel Pro Support": "Parcel Pro Support",
"Online": "● Online",
"Hello!": "Hello! 👋",
"Welcome to Parcel Pro Customer Support.": "Welcome to Parcel Pro Customer Support.",
"How can we help you today?": "How can we help you today?",
"Where is my parcel?": "Where is my parcel?",
"Track my parcel": "Track my parcel",
"Delivery help": "Delivery help",
"Speak to support": "Speak to support",
"Type your message...": "Type your message...",
"Welcome to Parcel Pro Support!": "Welcome to Parcel Pro Support!",
"Please enter your name:": "Please enter your name:",
"Please enter your email address:": "Please enter your email address:",
"Please enter a valid email address, for example name@example.com.": "Please enter a valid email address, for example name@example.com.",
        },

        es: {
            Home: "Inicio",
            About: "Acerca de",
            Login: "Iniciar sesión",
            "Fast & Reliable Delivery":
    "Entrega rápida y confiable",

"We make sure your packages reach their destination safely and on time.":
    "Nos aseguramos de que tus paquetes lleguen a su destino de forma segura y puntual.",

"Real-Time Tracking":
    "Seguimiento en tiempo real",

"Track your parcel and stay updated on its delivery progress from anywhere.":
    "Rastrea tu paquete y mantente informado sobre su progreso desde cualquier lugar.",

"Secure Package Handling":
    "Manejo seguro de paquetes",

"Your packages are handled carefully from pickup to final delivery.":
    "Tus paquetes se manejan cuidadosamente desde la recogida hasta la entrega final.",

"Worldwide Shipping":
    "Envíos internacionales",

"Send packages across cities, countries, and international destinations.":
    "Envía paquetes entre ciudades, países y destinos internacionales.",

    "Parcels Delivered": "Paquetes entregados",
"Happy Customers": "Clientes satisfechos",
"Countries Covered": "Países cubiertos",

"Customer Support":
    "Atención al cliente",

    "About ParcelPro": "Acerca de ParcelPro",
"ParcelPro is a modern parcel delivery and tracking service built to make shipping simple, reliable, and transparent. From the moment your package leaves the sender to the moment it reaches its destination, ParcelPro keeps you informed every step of the way.": "ParcelPro es un servicio moderno de entrega y seguimiento de paquetes diseñado para hacer que los envíos sean simples, confiables y transparentes. Desde el momento en que tu paquete sale del remitente hasta que llega a su destino, ParcelPro te mantiene informado en cada paso.",
"Reliable Delivery": "Entrega confiable",
"We focus on safe and dependable parcel delivery.": "Nos enfocamos en una entrega de paquetes segura y confiable.",
"Real-Time Tracking": "Seguimiento en tiempo real",
"Track your shipment and stay updated on its progress.": "Rastrea tu envío y mantente al día con su progreso.",
"Secure Handling": "Manejo seguro",
"Your parcels are handled with care from pickup to delivery.": "Tus paquetes son manejados con cuidado desde la recogida hasta la entrega.",

"Get help whenever you need it through our customer support team.":
    "Obtén ayuda cuando la necesites a través de nuestro equipo de atención al cliente.",

"Competitive Pricing":
    "Precios competitivos",

"Enjoy dependable shipping services at prices designed to give you great value.":
    "Disfruta de servicios de envío confiables a precios diseñados para ofrecerte un gran valor.",

"We make shipping simple, secure, and reliable.":
    "Hacemos que los envíos sean simples, seguros y confiables.",
            "Track Parcel": "Rastrear paquete",
            "Welcome to Parcel Pro": "Bienvenido a Parcel Pro",
            "Why Choose Parcel Pro?":
                "¿Por qué elegir Parcel Pro?",
            "Track Your Parcel": "Rastrea tu paquete",
            "Enter your tracking number below.":
                "Introduce tu número de seguimiento abajo.",
            Track: "Rastrear",
            "Shipment Found": "Envío encontrado",
            "Your parcel is on its way":
                "Tu paquete está en camino",
            "TRACKING NUMBER": "NÚMERO DE SEGUIMIENTO",
            "Shipment Confirmed": "Envío confirmado",
            "Your shipment has been created":
                "Tu envío ha sido creado",
            "Picked Up": "Recogido",
            "Parcel received for delivery":
                "Paquete recibido para entrega",
            "In Transit": "En tránsito",
            "Out for Delivery": "En reparto",
            "Your parcel is on the way to its destination":
                "Tu paquete está camino a su destino",
            Delivered: "Entregado",
            "Your parcel has been delivered":
                "Tu paquete ha sido entregado",
            Completed: "Completado",
            "Awaiting this stage":
                "Esperando esta etapa",
            CUSTOMER: "CLIENTE",
            DESTINATION: "DESTINO",
            Pending: "Pendiente",
            Preparing: "Preparando",
            "Shipment not found": "Envío no encontrado",
            "Please check your tracking number and try again.":
                "Comprueba tu número de seguimiento e inténtalo de nuevo.",
            "Please enter a tracking number.":
                "Introduce un número de seguimiento.",
            "Searching for your parcel...":
                "Buscando tu paquete...",

"Parcel Pro Support": "Soporte de Parcel Pro",
"Online": "● En línea",
"Hello!": "¡Hola! 👋",
"Welcome to Parcel Pro Customer Support.": "Bienvenido al servicio de atención al cliente de Parcel Pro.",
"How can we help you today?": "¿Cómo podemos ayudarte hoy?",
"Where is my parcel?": "¿Dónde está mi paquete?",
"Track my parcel": "Rastrear mi paquete",
"Delivery help": "Ayuda con la entrega",
"Speak to support": "Hablar con soporte",
"Type your message...": "Escribe tu mensaje...",
"Welcome to Parcel Pro Support!": "¡Bienvenido al soporte de Parcel Pro!",
"Please enter your name:": "Por favor, introduce tu nombre:",
"Please enter your email address:": "Por favor, introduce tu dirección de correo electrónico:",
"Please enter a valid email address, for example name@example.com.": "Por favor, introduce una dirección de correo electrónico válida, por ejemplo nombre@ejemplo.com."
        },

        fr: {
            Home: "Accueil",
            About: "À propos",
            Login: "Connexion",
            "Fast & Reliable Delivery":
    "Livraison rapide et fiable",

"We make sure your packages reach their destination safely and on time.":
    "Nous veillons à ce que vos colis arrivent à destination en toute sécurité et à temps.",

"Real-Time Tracking":
    "Suivi en temps réel",

"Track your parcel and stay updated on its delivery progress from anywhere.":
    "Suivez votre colis et restez informé de son évolution depuis n'importe où.",

"Secure Package Handling":
    "Manipulation sécurisée des colis",

"Your packages are handled carefully from pickup to final delivery.":
    "Vos colis sont manipulés avec soin, de la collecte à la livraison finale.",

"Worldwide Shipping":
    "Expédition internationale",

"Send packages across cities, countries, and international destinations.":
    "Envoyez des colis à travers les villes, les pays et les destinations internationales.",

"Customer Support":
    "Service client",

    "About ParcelPro": "À propos de ParcelPro",
"ParcelPro is a modern parcel delivery and tracking service built to make shipping simple, reliable, and transparent. From the moment your package leaves the sender to the moment it reaches its destination, ParcelPro keeps you informed every step of the way.": "ParcelPro est un service moderne de livraison et de suivi de colis conçu pour rendre l'expédition simple, fiable et transparente. Dès que votre colis quitte l'expéditeur jusqu'à son arrivée à destination, ParcelPro vous tient informé à chaque étape.",
"Reliable Delivery": "Livraison fiable",
"We focus on safe and dependable parcel delivery.": "Nous nous concentrons sur une livraison de colis sûre et fiable.",
"Real-Time Tracking": "Suivi en temps réel",
"Track your shipment and stay updated on its progress.": "Suivez votre envoi et restez informé de son évolution.",
"Secure Handling": "Manipulation sécurisée",
"Your parcels are handled with care from pickup to delivery.": "Vos colis sont manipulés avec soin, de la collecte à la livraison.",

"Parcels Delivered": "Colis livrés",
"Happy Customers": "Clients satisfaits",
"Countries Covered": "Pays couverts",

"Get help whenever you need it through our customer support team.":
    "Obtenez de l'aide quand vous en avez besoin grâce à notre équipe du service client.",

"Competitive Pricing":
    "Tarifs compétitifs",

"Enjoy dependable shipping services at prices designed to give you great value.":
    "Profitez de services d'expédition fiables à des prix conçus pour vous offrir un excellent rapport qualité-prix.",

"We make shipping simple, secure, and reliable.":
    "Nous rendons l'expédition simple, sûre et fiable.",
            "Track Parcel": "Suivre le colis",
            "Welcome to Parcel Pro":
                "Bienvenue chez Parcel Pro",
            "Why Choose Parcel Pro?":
                "Pourquoi choisir Parcel Pro ?",
            "Track Your Parcel": "Suivez votre colis",
            "Enter your tracking number below.":
                "Entrez votre numéro de suivi ci-dessous.",
            Track: "Suivre",
            "Shipment Found": "Envoi trouvé",
            "Your parcel is on its way":
                "Votre colis est en route",
            "TRACKING NUMBER": "NUMÉRO DE SUIVI",
            "Shipment Confirmed": "Envoi confirmé",
            "Your shipment has been created":
                "Votre envoi a été créé",
            "Picked Up": "Ramassé",
            "Parcel received for delivery":
                "Colis reçu pour livraison",
            "In Transit": "En transit",
            "Out for Delivery": "En cours de livraison",
            "Your parcel is on the way to its destination":
                "Votre colis est en route vers sa destination",
            Delivered: "Livré",
            "Your parcel has been delivered":
                "Votre colis a été livré",
            Completed: "Terminé",
            "Awaiting this stage":
                "En attente de cette étape",
            CUSTOMER: "CLIENT",
            DESTINATION: "DESTINATION",
            Pending: "En attente",
            Preparing: "Préparation",
            "Shipment not found": "Envoi introuvable",
            "Please check your tracking number and try again.":
                "Vérifiez votre numéro de suivi et réessayez.",
            "Please enter a tracking number.":
                "Veuillez entrer un numéro de suivi.",
            "Searching for your parcel...":
                "Recherche de votre colis...",

"Parcel Pro Support": "Assistance Parcel Pro",
"Online": "● En ligne",
"Hello!": "Bonjour ! 👋",
"Welcome to Parcel Pro Customer Support.": "Bienvenue au service client de Parcel Pro.",
"How can we help you today?": "Comment pouvons-nous vous aider aujourd’hui ?",
"Where is my parcel?": "Où est mon colis ?",
"Track my parcel": "Suivre mon colis",
"Delivery help": "Aide à la livraison",
"Speak to support": "Parler au support",
"Type your message...": "Écrivez votre message...",
"Welcome to Parcel Pro Support!": "Bienvenue dans l’assistance Parcel Pro !",
"Please enter your name:": "Veuillez saisir votre nom :",
"Please enter your email address:": "Veuillez saisir votre adresse e-mail :",
"Please enter a valid email address, for example name@example.com.": "Veuillez saisir une adresse e-mail valide, par exemple nom@exemple.com."
        },

        de: {
    Home: "Startseite",
    About: "Über uns",
    Login: "Anmelden",

    "Fast & Reliable Delivery":
        "Schnelle und zuverlässige Lieferung",

    "We make sure your packages reach their destination safely and on time.":
        "Wir sorgen dafür, dass Ihre Pakete sicher und pünktlich am Ziel ankommen.",

    "Real-Time Tracking":
        "Echtzeit-Tracking",

    "Track your parcel and stay updated on its delivery progress from anywhere.":
        "Verfolgen Sie Ihr Paket und bleiben Sie von überall über den Lieferfortschritt informiert.",

    "Secure Package Handling":
        "Sichere Paketabwicklung",

    "Your packages are handled carefully from pickup to final delivery.":
        "Ihre Pakete werden von der Abholung bis zur endgültigen Zustellung sorgfältig behandelt.",

    "Worldwide Shipping":
        "Weltweiter Versand",

    "Send packages across cities, countries, and international destinations.":
        "Versenden Sie Pakete in Städte, Länder und internationale Zielorte.",

    "Customer Support":
        "Kundensupport",

        "About ParcelPro": "Über ParcelPro",
"ParcelPro is a modern parcel delivery and tracking service built to make shipping simple, reliable, and transparent. From the moment your package leaves the sender to the moment it reaches its destination, ParcelPro keeps you informed every step of the way.": "ParcelPro ist ein moderner Paketliefer- und Trackingdienst, der den Versand einfach, zuverlässig und transparent macht. Vom Moment, in dem Ihr Paket den Absender verlässt, bis es sein Ziel erreicht, hält ParcelPro Sie über jeden Schritt auf dem Laufenden.",
"Reliable Delivery": "Zuverlässige Lieferung",
"We focus on safe and dependable parcel delivery.": "Wir konzentrieren uns auf eine sichere und zuverlässige Paketzustellung.",
"Real-Time Tracking": "Echtzeit-Tracking",
"Track your shipment and stay updated on its progress.": "Verfolgen Sie Ihre Sendung und bleiben Sie über ihren Fortschritt informiert.",
"Secure Handling": "Sichere Handhabung",
"Your parcels are handled with care from pickup to delivery.": "Ihre Pakete werden von der Abholung bis zur Zustellung sorgfältig behandelt.",

"Parcels Delivered": "Zugestellte Pakete",
"Happy Customers": "Zufriedene Kunden",
"Countries Covered": "Abgedeckte Länder",

    "Get help whenever you need it through our customer support team.":
        "Erhalten Sie jederzeit Unterstützung durch unser Kundenservice-Team.",

    "Competitive Pricing":
        "Wettbewerbsfähige Preise",

    "Enjoy dependable shipping services at prices designed to give you great value.":
        "Genießen Sie zuverlässige Versanddienste zu Preisen mit einem hervorragenden Preis-Leistungs-Verhältnis.",

    "We make shipping simple, secure, and reliable.":
        "Wir machen den Versand einfach, sicher und zuverlässig.",

    "Track Parcel": "Paket verfolgen",

    "Welcome to Parcel Pro":
        "Willkommen bei Parcel Pro",

    "Why Choose Parcel Pro?":
        "Warum Parcel Pro wählen?",

    "Track Your Parcel":
        "Verfolgen Sie Ihr Paket",

    "Enter your tracking number below.":
        "Geben Sie unten Ihre Sendungsnummer ein.",

    Track: "Verfolgen",

    "Shipment Found":
        "Sendung gefunden",

    "Your parcel is on its way":
        "Ihr Paket ist unterwegs",

    "TRACKING NUMBER":
        "SENDUNGSNUMMER",

    "Shipment Confirmed":
        "Sendung bestätigt",

    "Your shipment has been created":
        "Ihre Sendung wurde erstellt",

    "Picked Up":
        "Abgeholt",

    "Parcel received for delivery":
        "Paket zur Zustellung erhalten",

    "In Transit":
        "Unterwegs",

    "Out for Delivery":
        "Zur Zustellung unterwegs",

    "Your parcel is on the way to its destination":
        "Ihr Paket ist auf dem Weg zum Ziel",

    Delivered:
        "Zugestellt",

    "Your parcel has been delivered":
        "Ihr Paket wurde zugestellt",

    Completed:
        "Abgeschlossen",

    "Awaiting this stage":
        "Diese Phase steht noch aus",

    CUSTOMER:
        "KUNDE",

    DESTINATION:
        "ZIEL",

    Pending:
        "Ausstehend",

    Preparing:
        "Vorbereitung",

    "Shipment not found":
        "Sendung nicht gefunden",

    "Please check your tracking number and try again.":
        "Bitte überprüfen Sie Ihre Sendungsnummer und versuchen Sie es erneut.",

    "Please enter a tracking number.":
        "Bitte geben Sie eine Sendungsnummer ein.",

    "Searching for your parcel...":
        "Suche nach Ihrem Paket...",

"Parcel Pro Support": "Parcel Pro Support",
"Online": "● Online",
"Hello!": "Hallo! 👋",
"Welcome to Parcel Pro Customer Support.": "Willkommen beim Parcel Pro-Kundensupport.",
"How can we help you today?": "Wie können wir Ihnen heute helfen?",
"Where is my parcel?": "Wo ist mein Paket?",
"Track my parcel": "Mein Paket verfolgen",
"Delivery help": "Hilfe bei der Lieferung",
"Speak to support": "Mit dem Support sprechen",
"Type your message...": "Geben Sie Ihre Nachricht ein...",
"Welcome to Parcel Pro Support!": "Willkommen beim Parcel Pro Support!",
"Please enter your name:": "Bitte geben Sie Ihren Namen ein:",
"Please enter your email address:": "Bitte geben Sie Ihre E-Mail-Adresse ein:",
"Please enter a valid email address, for example name@example.com.": "Bitte geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel name@beispiel.de."
},            

        zh: {
            Home: "首页",
            About: "关于我们",
            Login: "登录",
                "Fast & Reliable Delivery":
        "快速可靠的配送",

    "We make sure your packages reach their destination safely and on time.":
        "我们确保您的包裹安全、准时地到达目的地。",

    "Real-Time Tracking":
        "实时追踪",

    "Track your parcel and stay updated on its delivery progress from anywhere.":
        "随时随地追踪您的包裹并了解配送进度。",

    "Secure Package Handling":
        "安全的包裹处理",

    "Your packages are handled carefully from pickup to final delivery.":
        "您的包裹从取件到最终配送都会得到妥善处理。",

    "Worldwide Shipping":
        "全球配送",

    "Send packages across cities, countries, and international destinations.":
        "将包裹寄往不同城市、国家和国际目的地。",

    "Customer Support":
        "客户支持",

        "About ParcelPro": "关于ParcelPro",
"ParcelPro is a modern parcel delivery and tracking service built to make shipping simple, reliable, and transparent. From the moment your package leaves the sender to the moment it reaches its destination, ParcelPro keeps you informed every step of the way.": "ParcelPro是一项现代化的包裹配送和追踪服务，旨在让寄送变得简单、可靠且透明。从您的包裹离开发件人开始，到抵达目的地，ParcelPro都会让您随时了解每一步的进展。",
"Reliable Delivery": "可靠配送",
"We focus on safe and dependable parcel delivery.": "我们专注于安全可靠的包裹配送。",
"Real-Time Tracking": "实时追踪",
"Track your shipment and stay updated on its progress.": "追踪您的货件并随时了解其进度。",
"Secure Handling": "安全处理",
"Your parcels are handled with care from pickup to delivery.": "从取件到送达，我们都会小心处理您的包裹。",

"Parcels Delivered": "已送达包裹",
"Happy Customers": "满意的客户",
"Countries Covered": "覆盖的国家",

    
    "Get help whenever you need it through our customer support team.":
        "您可以随时通过我们的客户支持团队获得帮助。",

    "Competitive Pricing":
        "具有竞争力的价格",

    "Enjoy dependable shipping services at prices designed to give you great value.":
        "以合理的价格享受可靠的配送服务，获得超值体验。",

    "We make shipping simple, secure, and reliable.":
        "让配送变得简单、安全且可靠。",
            "Track Parcel": "追踪包裹",
            "Welcome to Parcel Pro":
                "欢迎来到 Parcel Pro",
            "Why Choose Parcel Pro?":
                "为什么选择 Parcel Pro？",
            "Track Your Parcel": "追踪您的包裹",
            "Enter your tracking number below.":
                "请在下方输入您的追踪号码。",
            Track: "追踪",
            "Shipment Found": "找到货件",
            "Your parcel is on its way":
                "您的包裹正在运输途中",
            "TRACKING NUMBER": "追踪号码",
            "Shipment Confirmed": "货件已确认",
            "Your shipment has been created":
                "您的货件已创建",
            "Picked Up": "已取件",
            "Parcel received for delivery":
                "包裹已收到，准备配送",
            "In Transit": "运输中",
            "Out for Delivery": "派送中",
            "Your parcel is on the way to its destination":
                "您的包裹正在前往目的地",
            Delivered: "已送达",
            "Your parcel has been delivered":
                "您的包裹已送达",
            Completed: "已完成",
            "Awaiting this stage": "等待此阶段",
            CUSTOMER: "客户",
            DESTINATION: "目的地",
            Pending: "待处理",
            Preparing: "准备中",
            "Shipment not found": "未找到货件",
            "Please check your tracking number and try again.":
                "请检查您的追踪号码后重试。",
            "Please enter a tracking number.":
                "请输入追踪号码。",
            "Searching for your parcel...":
                "正在搜索您的包裹...",
               
"Parcel Pro Support": "Parcel Pro 客服",
"Online": "● 在线",
"Hello!": "您好！👋",
"Welcome to Parcel Pro Customer Support.": "欢迎使用 Parcel Pro 客户支持服务。",
"How can we help you today?": "今天我们可以如何帮助您？",
"Where is my parcel?": "我的包裹在哪里？",
"Track my parcel": "追踪我的包裹",
"Delivery help": "配送帮助",
"Speak to support": "联系客户支持",
"Type your message...": "输入您的消息...",
"Welcome to Parcel Pro Support!": "欢迎使用 Parcel Pro 客户支持！",
"Please enter your name:": "请输入您的姓名：",
"Please enter your email address:": "请输入您的电子邮箱地址：",
"Please enter a valid email address, for example name@example.com.": "请输入有效的电子邮箱地址，例如 name@example.com。"
        },

        ja: {
            Home: "ホーム",
            About: "会社情報",
            Login: "ログイン",
                "Fast & Reliable Delivery":
        "迅速で信頼できる配送",

    "We make sure your packages reach their destination safely and on time.":
        "お荷物が安全かつ時間通りに目的地へ届くよう努めています。",

    "Real-Time Tracking":
        "リアルタイム追跡",

    "Track your parcel and stay updated on its delivery progress from anywhere.":
        "どこからでも荷物を追跡し、配送状況を確認できます。",

    "Secure Package Handling":
        "安全な荷物取り扱い",

    "Your packages are handled carefully from pickup to final delivery.":
        "集荷から最終配送まで、お荷物を丁寧に取り扱います。",

    "Worldwide Shipping":
        "世界各地への配送",

    "Send packages across cities, countries, and international destinations.":
        "都市、国、そして世界各地の目的地へ荷物を発送できます。",

    "Customer Support":
        "カスタマーサポート",

        "About ParcelPro": "ParcelProについて",
"ParcelPro is a modern parcel delivery and tracking service built to make shipping simple, reliable, and transparent. From the moment your package leaves the sender to the moment it reaches its destination, ParcelPro keeps you informed every step of the way.": "ParcelProは、配送をシンプルで信頼性が高く、透明性のあるものにするために作られた、現代的な荷物配送・追跡サービスです。荷物が発送元を出発した瞬間から目的地に到着するまで、ParcelProが各段階の状況をお知らせします。",
"Reliable Delivery": "信頼できる配送",
"We focus on safe and dependable parcel delivery.": "安全で信頼性の高い荷物の配送を大切にしています。",
"Real-Time Tracking": "リアルタイム追跡",
"Track your shipment and stay updated on its progress.": "荷物を追跡し、配送状況をリアルタイムで確認できます。",
"Secure Handling": "安全な取り扱い",
"Your parcels are handled with care from pickup to delivery.": "集荷から配達まで、お荷物を丁寧に取り扱います。",

        "Parcels Delivered": "配達済みの荷物",
"Happy Customers": "満足したお客様",
"Countries Covered": "対応国",

    "Get help whenever you need it through our customer support team.":
        "必要なときはいつでも、カスタマーサポートチームが対応します。",

    "Competitive Pricing":
        "競争力のある料金",

    "Enjoy dependable shipping services at prices designed to give you great value.":
        "お得な価格で信頼できる配送サービスをご利用いただけます。",

    "We make shipping simple, secure, and reliable.":
        "配送をシンプル、安全、そして信頼できるものにします。",
            "Track Parcel": "荷物を追跡",
            "Welcome to Parcel Pro":
                "Parcel Proへようこそ",
            "Why Choose Parcel Pro?":
                "Parcel Proを選ぶ理由",
            "Track Your Parcel": "荷物を追跡する",
            "Enter your tracking number below.":
                "下に追跡番号を入力してください。",
            Track: "追跡",
            "Shipment Found": "荷物が見つかりました",
            "Your parcel is on its way":
                "荷物は配送中です",
            "TRACKING NUMBER": "追跡番号",
            "Shipment Confirmed": "発送確認済み",
            "Your shipment has been created":
                "発送情報が作成されました",
            "Picked Up": "集荷済み",
            "Parcel received for delivery":
                "配送用の荷物を受け取りました",
            "In Transit": "輸送中",
            "Out for Delivery": "配達中",
            "Your parcel is on the way to its destination":
                "荷物は目的地へ向かっています",
            Delivered: "配達完了",
            "Your parcel has been delivered":
                "荷物が配達されました",
            Completed: "完了",
            "Awaiting this stage":
                "この段階を待っています",
            CUSTOMER: "お客様",
            DESTINATION: "配送先",
            Pending: "保留中",
            Preparing: "準備中",
            "Shipment not found": "荷物が見つかりません",
            "Please check your tracking number and try again.":
                "追跡番号を確認して、もう一度お試しください。",
            "Please enter a tracking number.":
                "追跡番号を入力してください。",
            "Searching for your parcel...":
                "荷物を検索しています...",

"Parcel Pro Support": "Parcel Pro サポート",
"Online": "● オンライン",
"Hello!": "こんにちは！👋",
"Welcome to Parcel Pro Customer Support.": "Parcel Pro カスタマーサポートへようこそ。",
"How can we help you today?": "本日はどのようなご用件でしょうか？",
"Where is my parcel?": "荷物はどこにありますか？",
"Track my parcel": "荷物を追跡する",
"Delivery help": "配送に関するサポート",
"Speak to support": "サポートに問い合わせる",
"Type your message...": "メッセージを入力してください...",
"Welcome to Parcel Pro Support!": "Parcel Pro サポートへようこそ！",
"Please enter your name:": "お名前を入力してください：",
"Please enter your email address:": "メールアドレスを入力してください：",
"Please enter a valid email address, for example name@example.com.": "name@example.com のような有効なメールアドレスを入力してください。",
"Searching for your parcel...":
    "荷物を検索しています...",
        },

        ar: {
            Home: "الرئيسية",
            About: "من نحن",
            Login: "تسجيل الدخول",
                "Fast & Reliable Delivery":
        "توصيل سريع وموثوق",

    "We make sure your packages reach their destination safely and on time.":
        "نضمن وصول طرودك إلى وجهتها بأمان وفي الوقت المحدد.",

    "Real-Time Tracking":
        "تتبع في الوقت الفعلي",

    "Track your parcel and stay updated on its delivery progress from anywhere.":
        "تتبع طردك وابقَ على اطلاع بتقدم عملية التوصيل من أي مكان.",

    "Secure Package Handling":
        "التعامل الآمن مع الطرود",

    "Your packages are handled carefully from pickup to final delivery.":
        "يتم التعامل مع طرودك بعناية من الاستلام حتى التسليم النهائي.",

    "Worldwide Shipping":
        "الشحن حول العالم",

    "Send packages across cities, countries, and international destinations.":
        "أرسل الطرود عبر المدن والدول والوجهات الدولية.",

    "Customer Support":
        "دعم العملاء",

        "About ParcelPro": "حول ParcelPro",
"ParcelPro is a modern parcel delivery and tracking service built to make shipping simple, reliable, and transparent. From the moment your package leaves the sender to the moment it reaches its destination, ParcelPro keeps you informed every step of the way.": "ParcelPro هي خدمة حديثة لتوصيل وتتبع الطرود، صُممت لجعل الشحن بسيطًا وموثوقًا وشفافًا. منذ لحظة مغادرة طردك للمرسل وحتى وصوله إلى وجهته، تبقيك ParcelPro على اطلاع بكل خطوة.",
"Reliable Delivery": "توصيل موثوق",
"We focus on safe and dependable parcel delivery.": "نركز على توصيل الطرود بأمان وموثوقية.",
"Real-Time Tracking": "التتبع في الوقت الفعلي",
"Track your shipment and stay updated on its progress.": "تتبع شحنتك وابقَ على اطلاع بتقدمها.",
"Secure Handling": "معالجة آمنة",
"Your parcels are handled with care from pickup to delivery.": "يتم التعامل مع طرودك بعناية من الاستلام حتى التسليم.",

"Parcels Delivered": "الطرود التي تم تسليمها",
"Happy Customers": "العملاء السعداء",
"Countries Covered": "الدول التي نغطيها",

    "Get help whenever you need it through our customer support team.":
        "احصل على المساعدة متى احتجت إليها من خلال فريق دعم العملاء.",

    "Competitive Pricing":
        "أسعار تنافسية",

    "Enjoy dependable shipping services at prices designed to give you great value.":
        "استمتع بخدمات شحن موثوقة بأسعار تمنحك قيمة رائعة.",

    "We make shipping simple, secure, and reliable.":
        "نجعل الشحن بسيطًا وآمنًا وموثوقًا.",
            "Track Parcel": "تتبع الطرد",
            "Welcome to Parcel Pro":
                "مرحبًا بك في Parcel Pro",
            "Why Choose Parcel Pro?":
                "لماذا تختار Parcel Pro؟",
            "Track Your Parcel": "تتبع طردك",
            "Enter your tracking number below.":
                "أدخل رقم التتبع أدناه.",
            Track: "تتبع",
            "Shipment Found": "تم العثور على الشحنة",
            "Your parcel is on its way":
                "طردك في الطريق",
            "TRACKING NUMBER": "رقم التتبع",
            "Shipment Confirmed": "تم تأكيد الشحنة",
            "Your shipment has been created":
                "تم إنشاء شحنتك",
            "Picked Up": "تم الاستلام",
            "Parcel received for delivery":
                "تم استلام الطرد للتوصيل",
            "In Transit": "قيد النقل",
            "Out for Delivery": "خرج للتوصيل",
            "Your parcel is on the way to its destination":
                "طردك في طريقه إلى وجهته",
            Delivered: "تم التسليم",
            "Your parcel has been delivered":
                "تم تسليم طردك",
            Completed: "مكتمل",
            "Awaiting this stage":
                "بانتظار هذه المرحلة",
            CUSTOMER: "العميل",
            DESTINATION: "الوجهة",
            Pending: "قيد الانتظار",
            Preparing: "قيد التجهيز",
            "Shipment not found": "لم يتم العثور على الشحنة",
            "Please check your tracking number and try again.":
                "يرجى التحقق من رقم التتبع والمحاولة مرة أخرى.",
            "Please enter a tracking number.":
                "يرجى إدخال رقم التتبع.",
            "Searching for your parcel...":
                "جارٍ البحث عن طردك...",
            
"Parcel Pro Support": "دعم Parcel Pro",
"Online": "● متصل",
"Hello!": "مرحبًا! 👋",
"Welcome to Parcel Pro Customer Support.": "مرحبًا بك في خدمة دعم عملاء Parcel Pro.",
"How can we help you today?": "كيف يمكننا مساعدتك اليوم؟",
"Where is my parcel?": "أين طردي؟",
"Track my parcel": "تتبع طردي",
"Delivery help": "مساعدة في التوصيل",
"Speak to support": "التحدث مع الدعم",
"Type your message...": "اكتب رسالتك...",
"Welcome to Parcel Pro Support!": "مرحبًا بك في دعم Parcel Pro!",
"Please enter your name:": "يرجى إدخال اسمك:",
"Please enter your email address:": "يرجى إدخال عنوان بريدك الإلكتروني:",
"Please enter a valid email address, for example name@example.com.": "يرجى إدخال عنوان بريد إلكتروني صالح، مثل name@example.com."
        }
    };

    window.getParcelProTranslation = function (key) {
        const language =
            localStorage.getItem("parcelProLanguage") || "en";

        const dictionary =
            translations[language] || translations.en;

        return dictionary[key] || translations.en[key] || key;
    };

    function translatePage(language) {

    const dictionary =
        translations[language] || translations.en;

    // Translate normal HTML elements
    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.getAttribute("data-i18n");

            if (dictionary[key]) {
                element.textContent =
                    dictionary[key];
            }

        });

    // Translate placeholders
    document
        .querySelectorAll("[data-i18n-placeholder]")
        .forEach(element => {

            const key =
                element.getAttribute(
                    "data-i18n-placeholder"
                );

            if (dictionary[key]) {
                element.placeholder =
                    dictionary[key];
            }

        });

    // Translate tracking timeline titles
    document
        .querySelectorAll(".tracking-step strong")
        .forEach(element => {

            const key =
                element.textContent.trim();

            if (dictionary[key]) {
                element.textContent =
                    dictionary[key];
            }

        });

    // Translate tracking timeline descriptions
    document
        .querySelectorAll(".tracking-step span")
        .forEach(element => {

            const key =
                element.textContent.trim();

            if (dictionary[key]) {
                element.textContent =
                    dictionary[key];
            }

        });

    // Translate tracking labels and details
    document
        .querySelectorAll(
            ".tracking-label, .tracking-number-box span, .tracking-detail small"
        )
        .forEach(element => {

            let key =
                element.textContent.trim();

            // SHIPMENT FOUND is displayed in uppercase
            // but the dictionary uses "Shipment Found".
            if (
                key === "SHIPMENT FOUND" &&
                dictionary["Shipment Found"]
            ) {
                key = "Shipment Found";
            }

            if (dictionary[key]) {
                element.textContent =
                    dictionary[key];
            }

        });

    // Translate the main tracking result heading
document
    .querySelectorAll(".tracking-card-header h3")
    .forEach(element => {

        const key = "Your parcel is on its way";

        if (dictionary[key]) {
            element.textContent =
                "📦 " + dictionary[key];
        }

    });

    // Translate the tracking status badge
    document
        .querySelectorAll(".tracking-status")
        .forEach(element => {

            const key =
                element.textContent.trim();

            if (dictionary[key]) {
                element.textContent =
                    dictionary[key];
            }

        });
}

        window.translateParcelProDynamic = function () {
        const language =
            localStorage.getItem("parcelProLanguage") || "en";

        translatePage(language);
    };
    
    function applyLanguage(language) {

        localStorage.setItem(
            "parcelProLanguage",
            language
        );

        translatePage(language);

        document.documentElement.lang =
            language;

        if (language === "ar") {
            document.documentElement.dir =
                "rtl";
        } else {
            document.documentElement.dir =
                "ltr";
        }
    }

    const savedLanguage =
        localStorage.getItem(
            "parcelProLanguage"
        ) || "en";

    languageSelect.value =
        savedLanguage;

    applyLanguage(savedLanguage);

    languageSelect.addEventListener(
        "change",
        function () {

            applyLanguage(
                this.value
            );

        }
    );

}




// ========================================
// HOME PAGE TRACKING
// ========================================

function setupHomeTracking() {

    const form =
        document.getElementById(
            "homeTrackForm"
        );

    const input =
        document.getElementById(
            "homeTrackingInput"
        );

    const result =
        document.getElementById(
            "trackingResult"
        );

    if (
        !form ||
        !input ||
        !result ||
        form.dataset.ready === "true"
    ) {
        return;
    }

    form.dataset.ready = "true";

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const trackingNumber =
                input.value.trim();

            if (!trackingNumber) {

                result.innerHTML =
                    `
                    <p data-i18n="Please enter a tracking number.">
                     Please enter a tracking number.
                    </p>
                    `;

                return;
            }

            result.innerHTML =
                `
                <p data-i18n="Searching for your parcel...">
                 🔎 Searching for your parcel...
                </p>
                `;

            try {

                const response =
                    await fetch(
                        "/track-shipment/" +
                        encodeURIComponent(
                            trackingNumber
                        )
                    );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {

                    result.innerHTML =
                        `
                        <div class="tracking-error">

                            <strong data-i18n="Shipment not found">
                                  ❌ Shipment not found
                            </strong>
                            <p data-i18n="Please check your tracking number and try again.">
                                   Please check your
                                   tracking number and
                                   try again.
                            </p>

                        </div>
                        `;

                    return;
                }

                const shipment =
                    data.shipment;

                result.innerHTML =
    `
    <div class="professional-tracking-card">

        <div class="tracking-card-header">

            <div>
               <span
    class="tracking-label"
    data-i18n="Shipment Found"
>
    SHIPMENT FOUND
</span>

               <h3 data-i18n="Your parcel is on its way">
    📦 Your parcel is on its way
</h3>
            </div>

            <span
    class="tracking-status"
    data-i18n="${escapeHTML(shipment.status)}"
>
    ${escapeHTML(shipment.status)}
</span>

        </div>


        <div class="tracking-number-box">

           <span data-i18n="TRACKING NUMBER">
    TRACKING NUMBER
</span>

            <strong>
                ${escapeHTML(shipment.tracking_number)}
            </strong>

        </div>


        <div class="tracking-timeline">
    ${(() => {

        const stages = [
            {
                name: "Shipment Confirmed",
                description: "Your shipment has been created",
                icon: "✓"
            },
            {
                name: "Picked Up",
                description: "Parcel received for delivery",
                icon: "✓"
            },
            {
                name: "In Transit",
                description: "Your parcel is on its way",
                icon: "🚚"
            },
            {
                name: "Out for Delivery",
                description: "Your parcel is on the way to its destination",
                icon: "🚚"
            },
            {
                name: "Delivered",
                description: "Your parcel has been delivered",
                icon: "📍"
            }
        ];

        const statusOrder = {
            "Pending": 0,
            "Preparing": 0,
            "Shipment Confirmed": 0,
            "Picked Up": 1,
            "In Transit": 2,
            "Out for Delivery": 3,
            "Delivered": 4
        };

        const currentIndex =
            statusOrder[shipment.status] ?? 0;

        return stages.map((stage, index) => {

            let stepClass = "";

            if (index < currentIndex) {
                stepClass = "completed";
            } 
            else if (index === currentIndex) {
                stepClass = "current";
            }

            return `
                <div class="tracking-step ${stepClass}">

                    <div class="step-icon">
                        ${index < currentIndex ? "✓" : stage.icon}
                    </div>

                    <div class="step-content">

                <strong data-i18n="${stage.name}">
    ${stage.name}
</strong>

<span data-i18n="${
    index === currentIndex
        ? stage.description
        : index < currentIndex
            ? "Completed"
            : "Awaiting this stage"
}">
    ${
        index === currentIndex
            ? stage.description
            : index < currentIndex
                ? "Completed"
                : "Awaiting this stage"
    }
</span>        

                    </div>

                </div>

                ${
                    index < stages.length - 1
                        ? '<div class="tracking-line"></div>'
                        : ''
                }
            `;

        }).join("");

    })()}
</div>


        <div class="tracking-details">

            <div class="tracking-detail">

                <span class="detail-icon">
                    👤
                </span>

                <div>
                    <small data-i18n="CUSTOMER">CUSTOMER</small>

                    <strong>
                        ${escapeHTML(shipment.customer_name)}
                    </strong>
                </div>

            </div>


            <div class="tracking-detail">

                <span class="detail-icon">
                    📍
                </span>

                <div>
                    <small data-i18n="DESTINATION">DESTINATION</small>

                    <strong>
                        ${escapeHTML(shipment.destination)}
                    </strong>
                </div>

            </div>

        </div>

    </div>
    `;
// Re-apply the selected language to the newly created tracking result
if (window.translateParcelProDynamic) {
    window.translateParcelProDynamic();
}
            }

            catch (error) {

                console.error(
                    "Tracking error:",
                    error
                );

                result.innerHTML =
                    `
                    <p>
                        ❌ Unable to connect to
                        the tracking server.
                    </p>
                    `;

            }

        }
    );

}


// ========================================
// CUSTOMER CHAT VARIABLES
// ========================================

let customerName = "";

let customerEmail = "";

let chatConversation = null;

let chatRefreshTimer = null;

let customerHeartbeatTimer = null;

let lastMessageId = 0;


// ========================================
// CUSTOMER INFORMATION
// ========================================

function loadCustomerInformation() {

    try {

        customerName =
            localStorage.getItem(
                "parcelProCustomerName"
            ) || "";

        customerEmail =
            localStorage.getItem(
                "parcelProCustomerEmail"
            ) || "";

    }

    catch (error) {

        console.error(
            "Unable to load customer information:",
            error
        );

    }

}


function saveCustomerInformation(
    name,
    email
) {

    customerName =
        String(
            name || ""
        ).trim();

    customerEmail =
        String(
            email || ""
        )
        .trim()
        .toLowerCase();

    try {

        localStorage.setItem(
            "parcelProCustomerName",
            customerName
        );

        localStorage.setItem(
            "parcelProCustomerEmail",
            customerEmail
        );

    }

    catch (error) {

        console.error(
            "Unable to save customer information:",
            error
        );

    }

}


// ========================================
// ASK CUSTOMER FOR INFORMATION
// ========================================

function getCustomerTranslation(key) {
    if (typeof window.getParcelProTranslation === "function") {
        return window.getParcelProTranslation(key);
    }

    return key;
}

async function requestCustomerInformation() {

    loadCustomerInformation();

    if (
        customerName &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
    ) {

        return true;

    }

    const name =
        prompt(
            getCustomerTranslation("Welcome to Parcel Pro Support!") +
            "\n\n" +
            getCustomerTranslation("Please enter your name:")
        );

    if (
        !name ||
        !name.trim()
    ) {

        return false;

    }

    const email =
        prompt(
            getCustomerTranslation("Please enter your email address:")
        );

    if (
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {

        alert(
            getCustomerTranslation(
                "Please enter a valid email address, for example name@example.com."
            )
        );

        return false;

    }

    saveCustomerInformation(
        name,
        email
    );

    return true;

}


// ========================================
// CUSTOMER LOGIN / ONLINE
// ========================================

async function sendCustomerLogin() {

    if (
        !customerName ||
        !customerEmail
    ) {

        return;

    }

    try {

        const response =
            await fetch(
                "/customer-login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name:
                            customerName,

                        email:
                            customerEmail

                    })

                }
            );

        const data =
            await response.json();

        if (
            response.ok &&
            data.success
        ) {

            console.log(
                "Customer is now online."
            );

        }

    }

    catch (error) {

        console.error(
            "Customer login error:",
            error
        );

    }

}


// ========================================
// CUSTOMER HEARTBEAT
// ========================================

async function sendCustomerHeartbeat() {

    if (!customerEmail) {
        return;
    }

    if (!navigator.onLine) {
        return;
    }

    try {

        const response =
            await fetch(
                "/customer-heartbeat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email:
                            customerEmail

                    })

                }
            );

        const data =
            await response.json();

        if (
            response.ok &&
            data.success
        ) {

            console.log(
                "Customer heartbeat sent."
            );

        }

    }

    catch (error) {

        console.error(
            "Heartbeat error:",
            error
        );

    }

}


// ========================================
// START HEARTBEAT
// ========================================

function startCustomerHeartbeat() {

    stopCustomerHeartbeat();

    sendCustomerHeartbeat();

    customerHeartbeatTimer =
        setInterval(
            () => {

                sendCustomerHeartbeat();

            },
            30000
        );

}


// ========================================
// STOP HEARTBEAT
// ========================================

function stopCustomerHeartbeat() {

    if (
        customerHeartbeatTimer
    ) {

        clearInterval(
            customerHeartbeatTimer
        );

        customerHeartbeatTimer =
            null;

    }

}


// ========================================
// CUSTOMER LOGOUT / OFFLINE
// ========================================

async function sendCustomerLogout() {

    if (!customerEmail) {
        return;
    }

    try {

        const data =
            JSON.stringify({

                email:
                    customerEmail

            });

        if (
            navigator.sendBeacon
        ) {

            const blob =
                new Blob(
                    [data],
                    {
                        type:
                            "application/json"
                    }
                );

            navigator.sendBeacon(
                "/customer-logout",
                blob
            );

        }

        else {

            await fetch(
                "/customer-logout",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: data,

                    keepalive: true
                }
            );

        }

    }

    catch (error) {

        console.error(
            "Customer logout error:",
            error
        );

    }

}


// ========================================
// OPEN CUSTOMER CHAT
// ========================================

async function openChat() {

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );

    if (!chatWindow) {
        return;
    }

    const ready =
        await requestCustomerInformation();

    if (!ready) {
        return;
    }

    chatWindow.classList.add(
        "active"
    );

    const notification =
        document.querySelector(
            ".chat-notification"
        );

    if (notification) {

        notification.style.display =
            "none";

    }

    await sendCustomerLogin();

    startCustomerHeartbeat();

    await startCustomerConversation();

    startConversationAutoRefresh();

}


// ========================================
// CLOSE CUSTOMER CHAT
// ========================================

function closeChat() {

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );

    if (!chatWindow) {
        return;
    }

    chatWindow.classList.remove(
        "active"
    );

    stopConversationAutoRefresh();

}


// ========================================
// START CUSTOMER CONVERSATION
// ========================================

async function startCustomerConversation() {

    if (
        !customerName ||
        !customerEmail
    ) {

        return;

    }

    try {

        await loadCustomerConversation();

    }

    catch (error) {

        console.error(
            "Conversation start error:",
            error
        );

    }

}

// ========================================
// LOAD CUSTOMER CONVERSATION
// ========================================

async function loadCustomerConversation() {

    if (!customerEmail) {
        return;
    }

    try {

        const response =
            await fetch(
                "/customer-conversation/" +
                encodeURIComponent(
                    customerEmail
                ),
                {
                    cache:
                        "no-store"
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            return;

        }

        chatConversation =
            data.conversation;

        displayConversationMessages(
            data.messages || []
        );

    }

    catch (error) {

        console.error(
            "Conversation loading error:",
            error
        );

    }

}
// ========================================
// SCROLL CHAT TO BOTTOM
// ========================================

function scrollChatToBottom() {

    const chatMessages =
        document.getElementById(
            "chatMessages"
        );

    if (!chatMessages) {
        return;
    }

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// ========================================
// FORMAT MESSAGE DATE/TIME
// ========================================

function formatMessageTime(
    dateValue
) {

    if (!dateValue) {
        return "Just now";
    }

    const date =
        new Date(
            dateValue
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Just now";

    }

    return date.toLocaleString(
        [],
        {
            month:
                "short",

            day:
                "numeric",

            year:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"
        }
    );

}


// ========================================
// SEND CUSTOMER MESSAGE
// ========================================

async function sendCustomerMessage(
    message
) {

    if (!customerName) {

        const ready =
            await requestCustomerInformation();

        if (!ready) {
            return;
        }

    }

    if (!customerEmail) {
        return;
    }

    message =
        String(
            message || ""
        ).trim();

    if (!message) {
        return;
    }

    try {

        const response =
            await fetch(
                "/customer-chat",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            name:
                                customerName,

                            email:
                                customerEmail,

                            message:
                                message

                        })

                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Unable to send message."
            );

            return;

        }

        const input =
            document.getElementById(
                "customerChatInput"
            );

        if (input) {

            input.value =
                "";

        }

        await sendCustomerHeartbeat();

        await loadCustomerConversation();

    }

    catch (error) {

        console.error(
            "Send message error:",
            error
        );

        alert(
            "Unable to connect to Parcel Pro server."
        );

    }

}


// ========================================
// QUICK QUESTIONS
// ========================================

function setupQuickQuestions() {

    const quickQuestions =
        document.getElementById(
            "quickQuestions"
        );

    if (!quickQuestions) {
        return;
    }

    quickQuestions.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "button"
                );

            if (!button) {
                return;
            }

            const question =
                button.dataset.question;

            if (!question) {
                return;
            }

            sendCustomerMessage(
                question
            );

        }
    );

}

// ========================================
// CHAT BUTTONS
// ========================================

function setupChatButtons() {

    const chatToggle =
        document.getElementById(
            "chatToggle"
        );

    const chatClose =
        document.getElementById(
            "chatClose"
        );

    if (chatToggle) {

        chatToggle.addEventListener(
            "click",
            openChat
        );

    }

    if (chatClose) {

        chatClose.addEventListener(
            "click",
            closeChat
        );

    }

}


// ========================================
// AUTO REFRESH CUSTOMER CHAT
// ========================================

function startConversationAutoRefresh() {

    stopConversationAutoRefresh();

    chatRefreshTimer =
        setInterval(
            async () => {

                if (!customerEmail) {
                    return;
                }

                const chatWindow =
                    document.getElementById(
                        "chatWindow"
                    );

                if (
                    !chatWindow ||
                    !chatWindow.classList.contains(
                        "active"
                    )
                ) {

                    return;

                }

                await loadCustomerConversation();

            },
            3000
        );

}


function stopConversationAutoRefresh() {

    if (
        chatRefreshTimer
    ) {

        clearInterval(
            chatRefreshTimer
        );

        chatRefreshTimer =
            null;

    }

}


// ========================================
// CUSTOMER ONLINE STATUS
// ========================================

async function updateSupportOnlineStatus() {

    const statusElements =
        document.querySelectorAll(
            ".agent-info span"
        );

    if (!statusElements.length) {
        return;
    }

    if (!customerEmail) {

        statusElements.forEach(
            element => {

                element.textContent =
                    "● Offline";

                element.classList.add(
                    "offline"
                );

                element.classList.remove(
                    "online"
                );

            }
        );

        return;

    }

    try {

        const response =
            await fetch(
                "/customer-status/" +
                encodeURIComponent(
                    customerEmail
                ),
                {
                    cache:
                        "no-store"
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            return;

        }

        const online =
            data.exists &&
            Boolean(
                data.online ??
                data.customer?.is_online
            );

        statusElements.forEach(
            element => {

                if (online) {

                    element.textContent =
                        "● Online";

                    element.classList.add(
                        "online"
                    );

                    element.classList.remove(
                        "offline"
                    );

                }

                else {

                    element.textContent =
                        "● Offline";

                    element.classList.add(
                        "offline"
                    );

                    element.classList.remove(
                        "online"
                    );

                }

            }
        );

    }

    catch (error) {

        console.error(
            "Unable to check customer status:",
            error
        );

    }

}


// ========================================
// ADMIN DASHBOARD
// ========================================


// ========================================
// LOAD DASHBOARD STATISTICS
// ========================================

async function loadDashboardStats() {

    const total =
        document.getElementById(
            "totalShipments"
        );

    const inTransit =
        document.getElementById(
            "inTransit"
        );

    const delivered =
        document.getElementById(
            "delivered"
        );

    const pending =
        document.getElementById(
            "pending"
        );

    if (
        !total &&
        !inTransit &&
        !delivered &&
        !pending
    ) {

        return;

    }

    try {

        const response =
            await fetch(
                "/dashboard-stats",
                {
                    cache:
                        "no-store"
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            return;

        }

        const stats =
            data.stats || {};

        if (total) {

            total.textContent =
                stats.total || 0;

        }

        if (inTransit) {

            inTransit.textContent =
                stats.inTransit || 0;

        }

        if (delivered) {

            delivered.textContent =
                stats.delivered || 0;

        }

        if (pending) {

            pending.textContent =
                stats.pending || 0;

        }

    }

    catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );

    }

}


// ========================================
// LOAD SHIPMENTS
// ========================================

async function loadShipments() {

    const tableBody =
        document.getElementById(
            "shipmentTableBody"
        );

    if (!tableBody) {
        return;
    }

    try {

        const response =
            await fetch(
                "/shipments",
                {
                    cache:
                        "no-store"
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            tableBody.innerHTML =
                `
                <tr>

                    <td colspan="4">
                        Unable to load shipments.
                    </td>

                </tr>
                `;

            return;

        }

        tableBody.innerHTML =
            "";

        if (
            !data.shipments ||
            data.shipments.length === 0
        ) {

            tableBody.innerHTML =
                `
                <tr>

                    <td colspan="4">
                        No shipments yet.
                    </td>

                </tr>
                `;

            return;

        }

        data.shipments.forEach(
            shipment => {

                const row =
                    document.createElement(
                        "tr"
                    );

                    row.innerHTML =
    `
    <td>
        ${escapeHTML(
            shipment.tracking_number
        )}
    </td>

    <td>
        ${escapeHTML(
            shipment.customer_name
        )}
    </td>

    <td>
        ${escapeHTML(
            shipment.destination
        )}
    </td>

    <td>
        <select
            class="shipment-status-select"
            data-tracking-number="${escapeHTML(
                shipment.tracking_number
            )}"
        >
            <option value="Pending"
                ${shipment.status === "Pending" ? "selected" : ""}>
                Pending
            </option>

            <option value="Preparing"
                ${shipment.status === "Preparing" ? "selected" : ""}>
                Preparing
            </option>

            <option value="Picked Up"
                ${shipment.status === "Picked Up" ? "selected" : ""}>
                Picked Up
            </option>

            <option value="In Transit"
                ${shipment.status === "In Transit" ? "selected" : ""}>
                In Transit
            </option>

            <option value="Out for Delivery"
                ${shipment.status === "Out for Delivery" ? "selected" : ""}>
                Out for Delivery
            </option>

            <option value="Delivered"
                ${shipment.status === "Delivered" ? "selected" : ""}>
                Delivered
            </option>
        </select>

        <button
            type="button"
            class="update-shipment-status"
            data-tracking-number="${escapeHTML(
                shipment.tracking_number
            )}"
        >
            Update
        </button>
    </td>
    `;

                tableBody.appendChild(
                    row
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Shipment loading error:",
            error
        );

    }

}

// ========================================
// UPDATE SHIPMENT STATUS
// ========================================

async function updateShipmentStatus(trackingNumber, status, button) {

    if (!trackingNumber || !status) {
        return;
    }

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Updating...";

    try {

        const response = await fetch(
            "/update-shipment-status",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    trackingNumber: trackingNumber,
                    status: status
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to update shipment status."
            );

        }

        button.textContent = "Updated ✓";

        await loadDashboardStats();

        setTimeout(() => {

            button.textContent = originalText;
            button.disabled = false;

        }, 1500);

    }

    catch (error) {

        console.error(
            "Shipment status update error:",
            error
        );

        alert(
            error.message ||
            "Unable to update shipment status."
        );

        button.textContent = originalText;
        button.disabled = false;
    }
}


// ========================================
// SHIPMENT STATUS BUTTONS
// ========================================

function setupShipmentStatusUpdates() {

    const tableBody =
        document.getElementById(
            "shipmentTableBody"
        );

    if (!tableBody) {
        return;
    }

    if (
        tableBody.dataset.statusReady ===
        "true"
    ) {
        return;
    }

    tableBody.dataset.statusReady =
        "true";

    tableBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".update-shipment-status"
                );

            if (!button) {
                return;
            }

            const trackingNumber =
                button.dataset.trackingNumber;

            const select =
                tableBody.querySelector(
                    `.shipment-status-select[data-tracking-number="${CSS.escape(trackingNumber)}"]`
                );

            if (!select) {
                return;
            }

            updateShipmentStatus(
                trackingNumber,
                select.value,
                button
            );

        }
    );
}

// ========================================
// ADD SHIPMENT
// ========================================

function setupShipmentForm() {

    const form =
        document.getElementById(
            "shipmentForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const trackingNumber =
                document.getElementById(
                    "trackingNumber"
                )?.value.trim();

            const shipmentCustomerName =
                document.getElementById(
                    "customerName"
                )?.value.trim();

            const destination =
                document.getElementById(
                    "destination"
                )?.value.trim();

            const status =
                document.getElementById(
                    "status"
                )?.value;

            if (
                !trackingNumber ||
                !shipmentCustomerName ||
                !destination ||
                !status
            ) {

                alert(
                    "Please fill in all shipment fields."
                );

                return;

            }

            try {

                const response =
                    await fetch(
                        "/add-shipment",
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    trackingNumber,

                                    customerName:
                                        shipmentCustomerName,

                                    destination,

                                    status

                                })

                        }
                    );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {

                    alert(
                        data.message ||
                        "Unable to add shipment."
                    );

                    return;

                }

                alert(
                    "Shipment added successfully!"
                );

                form.reset();

                await loadShipments();

                await loadDashboardStats();

            }

            catch (error) {

                console.error(
                    "Add shipment error:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );

            }

        }
    );

}


// ========================================
// DASHBOARD SECTION SWITCHING
// ========================================

function formatAdminDate(value) {
    if (!value) {
        return "N/A";
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? String(value)
        : date.toLocaleString();
}

async function loadAdminCustomerPresence() {
    const container = document.getElementById(
        "customerPresenceContainer"
    );

    if (!container) {
        return;
    }

    container.innerHTML = "<p>Loading customer status...</p>";

    try {
        const response = await fetch(
            "/customer-presence",
            { cache: "no-store" }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to load customer status."
            );
        }

        const customers = data.customers || [];

        if (customers.length === 0) {
            container.innerHTML =
                "<p>No customers have contacted support yet.</p>";
            return;
        }

        container.innerHTML = "";

        customers.forEach(customer => {
            const online = Boolean(Number(customer.is_online));
            const card = document.createElement("div");
            card.className = "presence-card";
            card.innerHTML = `
                <div class="presence-card-header">
                    <div class="presence-customer">
                        <div class="presence-avatar">
                            ${escapeHTML(
                                (customer.customer_name || "C")
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase()
                            )}
                        </div>
                        <div class="presence-customer-info">
                            <strong>${escapeHTML(customer.customer_name)}</strong>
                            <small>${escapeHTML(customer.customer_email)}</small>
                        </div>
                    </div>
                    <div class="presence-status">
                        <span class="status-dot ${online ? "online" : "offline"}"></span>
                        <span>${online ? "Online" : "Offline"}</span>
                    </div>
                </div>
                <div class="presence-details">
                    <div class="presence-detail">
                        <span>🕒 Login</span>
                        <strong>${escapeHTML(formatAdminDate(customer.login_at))}</strong>
                    </div>
                    <div class="presence-detail">
                        <span>👁 Last seen</span>
                        <strong>${escapeHTML(formatAdminDate(customer.last_seen))}</strong>
                    </div>
                    <div class="presence-detail">
                        <span>↪ Logout</span>
                        <strong>${escapeHTML(formatAdminDate(customer.logout_at))}</strong>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Customer presence error:", error);
        container.innerHTML =
            "<p>❌ Unable to load customer status.</p>";
    }
}

function setupDashboardNavigation() {
    const links = {
        dashboard: document.getElementById("dashboardLink"),
        shipments: document.getElementById("shipmentsLink"),
        customers: document.getElementById("customersLink"),
        messages: document.getElementById("messagesLink"),
        settings: document.getElementById("settingsLink")
    };
    const sections = {
        shipments: document.getElementById("shipmentsSection"),
        customers: document.getElementById("customersSection"),
        messages: document.getElementById("messagesSection"),
        settings: document.getElementById("settingsSection")
    };

    if (!sections.shipments || sections.shipments.dataset.navigationReady) {
        return;
    }

    sections.shipments.dataset.navigationReady = "true";

    const showSection = sectionName => {
        Object.entries(sections).forEach(([name, section]) => {
            if (section) {
                section.style.display = name === sectionName
                    ? "block"
                    : "none";
            }
        });
    };

    const bindLink = (link, sectionName, onOpen) => {
        if (!link) {
            return;
        }

        link.addEventListener("click", event => {
            event.preventDefault();
            showSection(sectionName);

            if (onOpen) {
                onOpen();
            }
        });
    };

    bindLink(links.dashboard, "shipments", () => {
        loadDashboardStats();
        loadShipments();
    });
    bindLink(links.shipments, "shipments", loadShipments);
    bindLink(
        links.customers,
        "customers",
        loadAdminCustomerPresence
    );
    bindLink(
        links.messages,
        "messages",
        loadAdminConversations
    );
    bindLink(links.settings, "settings");

    setInterval(() => {
        loadDashboardStats();

        if (
            sections.customers &&
            sections.customers.style.display !== "none"
        ) {
            loadAdminCustomerPresence();
        }
    }, 5000);

}


// ========================================
// ADMIN CONVERSATIONS
// ========================================

let adminRefreshTimer = null;

let currentAdminCustomerEmail = "";

let currentAdminConversationId = null;

function normalizeAdminConversationEmail(value) {
    return String(value || "")
        .trim()
        .toLowerCase();
}

function setActiveAdminConversation(email, conversationId = null) {
    const normalizedEmail =
        normalizeAdminConversationEmail(email);

    const normalizedConversationId =
        Number.isSafeInteger(Number(conversationId)) && Number(conversationId) > 0
            ? Number(conversationId)
            : null;

    currentAdminCustomerEmail =
        normalizedEmail;

    currentAdminConversationId =
        normalizedConversationId;

    const conversationView =
        document.getElementById("conversationView");

    const replyForm =
        document.getElementById("conversationReplyForm");

    if (conversationView) {
        conversationView.dataset.customerEmail =
            normalizedEmail;

        if (normalizedConversationId) {
            conversationView.dataset.conversationId =
                String(normalizedConversationId);
        } else {
            delete conversationView.dataset.conversationId;
        }
    }

    if (replyForm) {
        replyForm.dataset.customerEmail =
            normalizedEmail;

        if (normalizedConversationId) {
            replyForm.dataset.conversationId =
                String(normalizedConversationId);
        } else {
            delete replyForm.dataset.conversationId;
        }
    }

    return normalizedEmail;
}

function setActiveAdminConversationEmail(email) {
    return setActiveAdminConversation(
        email,
        currentAdminConversationId
    );
}

function getActiveAdminConversationId() {
    const conversationView =
        document.getElementById("conversationView");

    const replyForm =
        document.getElementById("conversationReplyForm");

    const candidates = [
        currentAdminConversationId,
        replyForm?.dataset.conversationId,
        conversationView?.dataset.conversationId
    ];

    return candidates
        .map(Number)
        .find(value => Number.isSafeInteger(value) && value > 0) || null;
}

function getActiveAdminConversationEmail() {
    const conversationView =
        document.getElementById("conversationView");

    const replyForm =
        document.getElementById("conversationReplyForm");

    const candidates = [
        currentAdminCustomerEmail,
        replyForm?.dataset.customerEmail,
        conversationView?.dataset.customerEmail,
        conversationView?.dataset.email
    ];

    return candidates
        .map(normalizeAdminConversationEmail)
        .find(Boolean) || "";
}


// ========================================
// LOAD CONVERSATION LIST
// ========================================

function showDeleteDialog({ title, description, confirmLabel }) {
    return new Promise(resolve => {
        document.querySelector(".delete-dialog-backdrop")?.remove();

        const backdrop = document.createElement("div");
        backdrop.className = "delete-dialog-backdrop";
        backdrop.innerHTML = `
            <div
                class="delete-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="deleteDialogTitle"
                aria-describedby="deleteDialogDescription"
            >
                <div class="delete-dialog-icon" aria-hidden="true">🗑</div>
                <div class="delete-dialog-copy">
                    <h3 id="deleteDialogTitle"></h3>
                    <p id="deleteDialogDescription"></p>
                </div>
                <div class="delete-dialog-actions">
                    <button type="button" class="delete-dialog-cancel">
                        Cancel
                    </button>
                    <button type="button" class="delete-dialog-confirm"></button>
                </div>
            </div>
        `;

        const dialog = backdrop.querySelector(".delete-dialog");
        const cancelButton = backdrop.querySelector(".delete-dialog-cancel");
        const confirmButton = backdrop.querySelector(".delete-dialog-confirm");
        backdrop.querySelector("#deleteDialogTitle").textContent = title;
        backdrop.querySelector("#deleteDialogDescription").textContent =
            description;
        confirmButton.textContent = confirmLabel;

        let settled = false;

        const close = confirmed => {
            if (settled) return;
            settled = true;
            document.removeEventListener("keydown", handleKeydown);
            backdrop.classList.remove("is-visible");
            setTimeout(() => backdrop.remove(), 160);
            resolve(confirmed);
        };

        const handleKeydown = event => {
            if (event.key === "Escape") {
                close(false);
            }
        };

        backdrop.addEventListener("click", event => {
            if (event.target === backdrop) {
                close(false);
            }
        });
        dialog.addEventListener("click", event => event.stopPropagation());
        cancelButton.addEventListener("click", () => close(false));
        confirmButton.addEventListener("click", () => close(true));
        document.addEventListener("keydown", handleKeydown);
        document.body.appendChild(backdrop);
        requestAnimationFrame(() => {
            backdrop.classList.add("is-visible");
            confirmButton.focus();
        });
    });
}

async function deleteAdminMessage(messageId) {
    if (!messageId) {
        return;
    }

    const confirmed = await showDeleteDialog({
        title: "Delete message?",
        description:
            "This message or photo will be removed for both you and the customer.",
        confirmLabel: "Delete for everyone"
    });

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            "/admin/messages/delete",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId })
            }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to delete message.");
        }

        if (currentAdminCustomerEmail) {
            await loadAdminConversation(currentAdminCustomerEmail);
        }
    } catch (error) {
        alert(error.message || "Unable to delete message.");
    }
}

async function deleteAdminConversation(email) {
    if (!email) {
        return;
    }

    const confirmed = await showDeleteDialog({
        title: "Delete conversation?",
        description:
            "All messages and photos in this conversation will be permanently removed.",
        confirmLabel: "Delete conversation"
    });

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            "/admin/conversations/delete",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Unable to delete conversation."
            );
        }

        setActiveAdminConversation("", null);
        await loadAdminConversations();
    } catch (error) {
        alert(error.message || "Unable to delete conversation.");
    }
}

async function loadAdminConversations() {

    const container =
        document.getElementById(
            "messagesContainer"
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                "/conversations",
                {
                    cache:
                        "no-store"
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            container.innerHTML =
                `
                <p>
                    Unable to load conversations.
                </p>
                `;

            return;

        }

        container.innerHTML =
            "";

        if (
            !data.conversations ||
            data.conversations.length === 0
        ) {

            container.innerHTML =
                `
                <p>
                    No customer messages yet.
                </p>
                `;

            return;

        }

        for (
            const conversation
            of data.conversations
        ) {

            const item = document.createElement("button");
            item.type = "button";
            item.className = "support-conversation";

            const online =
                await awaitCustomerOnlineStatus(
                    conversation.customer_email
                );

            item.innerHTML =
                `
                <div class="conversation-header">

                    <strong>
                        ${escapeHTML(
                            conversation.customer_name
                        )}
                    </strong>

                    <span
                        class="${
                            online
                                ? "online"
                                : "offline"
                        }"
                    >
                        ● ${
                            online
                                ? "Online"
                                : "Offline"
                        }
                    </span>

                </div>

                <p>
                    ${escapeHTML(
                        conversation.customer_email
                    )}
                </p>

                <p>
                    ${escapeHTML(
                        conversation.last_message ||
                        ""
                    )}
                </p>

                <small>
                    ${formatMessageTime(
                        conversation.last_message_at
                    )}
                </small>
                `;

            item.innerHTML = `
                <span class="support-avatar" aria-hidden="true">${escapeHTML((conversation.customer_name || "C").trim().charAt(0).toUpperCase())}</span>
                <span class="support-conversation-content">
                    <span class="support-conversation-topline">
                        <strong>${escapeHTML(conversation.customer_name)}</strong>
                        <time>${formatMessageTime(conversation.last_message_at)}</time>
                    </span>
                    <span class="support-email">${escapeHTML(conversation.customer_email)}</span>
                    <span class="support-preview">${escapeHTML(conversation.last_message || "No messages yet.")}</span>
                </span>
                <span class="support-chevron" aria-hidden="true">›</span>
            `;

            item.addEventListener(
                "click",
                () => {

                    openAdminConversation(
                        conversation.customer_email,
                        conversation.id
                    );

                }
            );

            const row = document.createElement("div");
            row.className = "support-conversation-row";

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className =
                "conversation-delete-button message-options-button";
            deleteButton.textContent = "⋮";
            deleteButton.title = "Conversation options";
            deleteButton.setAttribute(
                "aria-label",
                `Delete conversation with ${conversation.customer_name}`
            );
            deleteButton.addEventListener("click", event => {
                event.stopPropagation();
                deleteAdminConversation(conversation.customer_email);
            });

            row.append(item, deleteButton);
            container.appendChild(row);

        }

    }

    catch (error) {

        console.error(
            "Admin conversation loading error:",
            error
        );

        container.innerHTML =
            `
            <p>
                Unable to connect to server.
            </p>
            `;

    }

}


// ========================================
// CHECK CUSTOMER ONLINE STATUS
// ========================================

async function awaitCustomerOnlineStatus(
    email
) {

    try {

        const response =
            await fetch(
                "/customer-status/" +
                encodeURIComponent(
                    email
                ),
                {
                    cache:
                        "no-store"
                }
            );

        const data =
            await response.json();

        return Boolean(
            data.exists &&
            (
                data.online ??
                data.customer?.is_online
            )
        );

    }

    catch (error) {

        return false;

    }

}


// ========================================
// OPEN ADMIN CONVERSATION
// ========================================

async function openAdminConversation(
    email,
    conversationId = null
) {

    const listView =
        document.getElementById(
            "conversationListView"
        );

    const conversationView =
        document.getElementById(
            "conversationView"
        );

    if (
        !listView ||
        !conversationView
    ) {

        return;

    }

    const activeCustomerEmail =
        setActiveAdminConversation(email, conversationId);

    listView.style.display =
        "none";

    conversationView.style.display =
        "block";

    await loadAdminConversation(
        activeCustomerEmail,
        getActiveAdminConversationId()
    );

    loadCustomerPresenceInHeader(activeCustomerEmail);

}


// ========================================
// LOAD ADMIN CONVERSATION
// ========================================

async function loadAdminConversation(
    email,
    conversationId = getActiveAdminConversationId()
) {

    const messagesContainer =
        document.getElementById(
            "conversationMessages"
        );

    const title =
        document.getElementById(
            "conversationTitle"
        );

    if (!messagesContainer) {
        return;
    }

    try {

        const response =
            await fetch(
                conversationId
                    ? "/conversations/by-id/" + conversationId
                    : "/conversations/" + encodeURIComponent(email),
                {
                    cache:
                        "no-store"
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            messagesContainer.innerHTML =
                `
                <p>
                    Unable to load conversation.
                </p>
                `;

            return;

        }

        if (
            title &&
            data.conversation
        ) {

            const activeCustomerEmail =
                setActiveAdminConversation(
                    data.conversation.customer_email || email,
                    data.conversation.id || conversationId
                );

            title.textContent = data.conversation.customer_name;
            document.getElementById("conversationSubtitle").textContent =
                activeCustomerEmail;
            document.querySelector(".conversation-avatar").textContent =
                (data.conversation.customer_name || "C").trim().charAt(0).toUpperCase();

        }

        messagesContainer.innerHTML =
            "";

        if (
            !data.messages ||
            data.messages.length === 0
        ) {

            messagesContainer.innerHTML =
                `
                <p>
                    No messages.
                </p>
                `;

            return;

        }

        data.messages.forEach(
            message => {

                const wrapper =
                    document.createElement(
                        "div"
                    );

                wrapper.className =
                    "admin-chat-message " +
                    (
                        message.sender ===
                        "admin"
                            ? "admin"
                            : "customer"
                    );

                const imageMarkup = message.image_url
                    ? `<img class="conversation-image" src="${escapeHTML(message.image_url)}" alt="${escapeHTML(message.original_name || "Shared image")}" loading="lazy">`
                    : "";

                wrapper.innerHTML =
                    `
                    <div class="admin-message-bubble">

                        <strong>

                            ${
                                message.sender ===
                                "admin"

                                    ? "You"

                                    : escapeHTML(
                                        data
                                            .conversation
                                            .customer_name
                                    )
                            }

                        </strong>

                        <p>
                            ${escapeHTML(
                                message.message
                            )}
                        </p>

                        ${imageMarkup}

                        <small>
                            ${formatMessageTime(
                                message.created_at
                            )}
                        </small>

                        <button
                            type="button"
                            class="admin-message-delete-button message-options-button"
                            data-message-id="${Number(message.id)}"
                        >
                            ⋮
                        </button>

                    </div>
                    `;

                wrapper
                    .querySelector(".admin-message-delete-button")
                    ?.addEventListener("click", () => {
                        deleteAdminMessage(Number(message.id));
                    });

                messagesContainer.appendChild(
                    wrapper
                );

            }
        );

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;

    }

    catch (error) {

        console.error(
            "Admin conversation error:",
            error
        );

    }

}
 
// ========================================
// BACK TO CONVERSATIONS
// ========================================

function setupBackToConversations() {

    const button =
        document.getElementById(
            "backToConversations"
        );

    const listView =
        document.getElementById(
            "conversationListView"
        );

    const conversationView =
        document.getElementById(
            "conversationView"
        );

    if (
        !button ||
        !listView ||
        !conversationView
    ) {

        return;

    }

    button.addEventListener(
        "click",
        () => {

            setActiveAdminConversation("", null);

            delete conversationView.dataset.email;
            delete conversationView.dataset.customerEmail;

            conversationView.style.display =
                "none";

            listView.style.display =
                "block";

            loadAdminConversations();

        }
    );

}


// ========================================
// ADMIN AUTO REFRESH
// ========================================

function startAdminAutoRefresh() {

    stopAdminAutoRefresh();

    if (
        !document.getElementById(
            "messagesSection"
        )
    ) {

        return;

    }

    adminRefreshTimer =
        setInterval(
            async () => {

                const messagesSection =
                    document.getElementById(
                        "messagesSection"
                    );

                if (
                    !messagesSection ||
                    messagesSection.style.display ===
                        "none"
                ) {

                    return;

                }

                if (
                    currentAdminCustomerEmail
                ) {

                    await loadAdminConversation(
                        currentAdminCustomerEmail
                    );

                }

                else {

                    await loadAdminConversations();

                }

            },
            5000
        );

}


function stopAdminAutoRefresh() {

    if (
        adminRefreshTimer
    ) {

        clearInterval(
            adminRefreshTimer
        );

        adminRefreshTimer =
            null;

    }

}


// ========================================
// NETWORK STATUS
// ========================================

window.addEventListener(
    "online",
    async () => {

        console.log(
            "Internet connection restored."
        );

        if (
            customerEmail &&
            customerName
        ) {

            await sendCustomerLogin();

            startCustomerHeartbeat();

        }

        updateSupportOnlineStatus();
        connectPresenceEvents("customer");
        startAdminPresence();

        ["pointerdown", "keydown", "touchstart", "focus"].forEach(eventName => {
            window.addEventListener(eventName, () => sendCustomerHeartbeat(), { passive: true });
        });
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                sendCustomerHeartbeat();
            }
        });

    }
);


window.addEventListener(
    "offline",
    () => {

        console.log(
            "Internet connection lost."
        );

        updateSupportOnlineStatus();

    }
);


// ========================================
// PAGE / BROWSER CLOSE
// ========================================

window.addEventListener(
    "beforeunload",
    () => {

        sendCustomerLogout();

    }
);


// ========================================
// HTML ESCAPE
// ========================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(
            value || ""
        );

    return div.innerHTML;

}


// ========================================
// LOGOUT
// ========================================

function logout() {

    const token =
    sessionStorage.getItem("parcelProAdminPresenceToken") ||
    localStorage.getItem("parcelProAdminPresenceToken");
    if (token) {
        navigator.sendBeacon(
            "/presence/admin/disconnect",
            new Blob([JSON.stringify({ sessionId: getPresenceSessionId(), token })], { type: "application/json" })
        );
        sessionStorage.removeItem("parcelProAdminPresenceToken");
        localStorage.removeItem("parcelProAdminPresenceToken");
    }

    localStorage.removeItem(
        "isLoggedIn"
    );

    window.location.href =
        "login.html";

}

window.logout =
    logout;


// ========================================
// IMAGE ATTACHMENTS
// ========================================

const selectedImages = { customer: null, admin: null };
const MAX_CLIENT_IMAGE_BYTES = 5 * 1024 * 1024;

function setupImageAttachment(kind) {
    const input = document.getElementById(`${kind}ImageInput`);
    const button = document.getElementById(`${kind}ImageButton`);
    const preview = document.getElementById(`${kind}ImagePreview`);
    if (!input || !button || !preview || input.dataset.ready) return;
    input.dataset.ready = "true";
    const clear = () => {
        selectedImages[kind] = null;
        input.value = "";
        preview.hidden = true;
        preview.querySelector("img").removeAttribute("src");
    };
    button.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
        const file = input.files && input.files[0];
        if (!file) return clear();
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_CLIENT_IMAGE_BYTES) {
            alert("Choose a JPG, PNG, or WEBP image up to 5 MB.");
            return clear();
        }
        selectedImages[kind] = file;
        preview.querySelector("img").src = URL.createObjectURL(file);
        preview.querySelector(".attachment-preview-name").textContent = file.name;
        preview.hidden = false;
    });
    preview.querySelector(".attachment-remove").addEventListener("click", clear);
}

function imageFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = () => reject(new Error("Unable to read selected image."));
        reader.readAsDataURL(file);
    });
}

async function sendConversationImage(sender, email, name, message, file, conversationId = null) {
    const body = {
        sender,
        email,
        name,
        message: String(message || "").trim(),
        imageName: file.name,
        imageData: await imageFileToBase64(file)
    };
       if (sender === "admin") {
    const auth = getAdminAuthData();

    body.sessionId = auth.sessionId;
    body.token = auth.token;
    body.conversationId = conversationId;
    }
    const response = await fetch("/conversation-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Unable to send image.");
}

function openImageLightbox(imageUrl, altText) {
    const lightbox = document.getElementById("messageImageLightbox");
    if (!lightbox) return;
    lightbox.querySelector("img").src = imageUrl;
    lightbox.querySelector("img").alt = altText || "Conversation image";
    lightbox.hidden = false;
    document.body.classList.add("image-lightbox-open");
}

function setupMessageImageLightbox() {
    if (document.getElementById("messageImageLightbox")) return;
    const lightbox = document.createElement("div");
    lightbox.id = "messageImageLightbox";
    lightbox.className = "message-image-lightbox";
    lightbox.hidden = true;
    lightbox.innerHTML = '<button type="button" aria-label="Close image">×</button><img alt="Conversation image">';
    lightbox.addEventListener("click", event => { if (event.target === lightbox || event.target.tagName === "BUTTON") { lightbox.hidden = true; document.body.classList.remove("image-lightbox-open"); } });
    document.body.appendChild(lightbox);
    document.addEventListener("click", event => {
        const image = event.target.closest(".conversation-image");
        if (image) openImageLightbox(image.src, image.alt);
    });
}

async function deleteCustomerChatMessage(messageId) {
    if (!customerEmail || !messageId) {
        return;
    }

    const confirmed = await showDeleteDialog({
        title: "Delete message?",
        description:
            "This message or photo will be removed for both you and ParcelPro support.",
        confirmLabel: "Delete for everyone"
    });

    if (!confirmed) {
        return;
    }

    try {
        await sendCustomerHeartbeat();

        const response = await fetch(
            "/customer-conversation/delete-message",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: customerEmail,
                    sessionId: getPresenceSessionId(),
                    messageId
                })
            }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to delete message.");
        }

        await loadCustomerConversation();
    } catch (error) {
        alert(error.message || "Unable to delete message.");
    }
}

function addMessageToChat(
    sender,
    message,
    createdAt,
    scroll = true,
    imageUrl = "",
    imageName = "",
    messageId = 0
) {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages || (!message && !imageUrl)) return;
    const wrapper = document.createElement("div");
    wrapper.className = "chat-message " + (sender === "admin" ? "support" : "customer");
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = sender === "admin" ? "🚚" : "👤";
    const content = document.createElement("div");
    content.className = "message-content";
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    if (imageUrl) {
        const image = document.createElement("img");
        image.className = "conversation-image";
        image.src = imageUrl;
        image.alt = imageName || "Shared image";
        image.loading = "lazy";
        bubble.appendChild(image);
    }
    if (message) { const paragraph = document.createElement("p"); paragraph.textContent = message; bubble.appendChild(paragraph); }
    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = formatMessageTime(createdAt);
    content.append(bubble, time);

    if (sender === "customer" && messageId) {
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className =
            "message-delete-button message-options-button";
        deleteButton.textContent = "⋮";
        deleteButton.title = "Message options";
        deleteButton.setAttribute(
            "aria-label",
            imageUrl ? "Delete your photo" : "Delete your message"
        );
        deleteButton.addEventListener("click", () => {
            deleteCustomerChatMessage(messageId);
        });
        content.appendChild(deleteButton);
    }

    wrapper.append(avatar, content);
    chatMessages.appendChild(wrapper);
    if (scroll) scrollChatToBottom();
}

function displayConversationMessages(messages) {
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) return;
    const quickQuestions = document.getElementById("quickQuestions");
    chatMessages.innerHTML = "";
    messages.forEach(message => addMessageToChat(
        message.sender,
        message.message,
        message.created_at,
        false,
        message.image_url,
        message.original_name,
        Number(message.id || 0)
    ));
    if (quickQuestions) chatMessages.appendChild(quickQuestions);
    if (messages.length) lastMessageId = Number(messages[messages.length - 1].id || 0);
    scrollChatToBottom();
}

function setupChatForm() {
    const form = document.getElementById("customerChatForm");
    const input = document.getElementById("customerChatInput");
    if (!form || !input || form.dataset.imageReady) return;
    form.dataset.imageReady = "true";
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const image = selectedImages.customer;
        const message = input.value.trim();
        if (!image && !message) return;
        try {
            if (image) {
                const ready = await requestCustomerInformation();
                if (!ready) return;
                await sendConversationImage("customer", customerEmail, customerName, message, image);
                selectedImages.customer = null;
                document.getElementById("customerImageInput").value = "";
                document.getElementById("customerImagePreview").hidden = true;
                input.value = "";
                await sendCustomerHeartbeat();
                await loadCustomerConversation();
            } else {
                await sendCustomerMessage(message);
            }
        } catch (error) { alert(error.message || "Unable to send image."); }
    });
}

function setupAdminReplyForm() {

    const form =
        document.getElementById("conversationReplyForm");

    const textarea =
        document.getElementById("conversationReply");

    if (!form || !textarea) {
        console.warn(
            "Parcel Pro: Admin reply form not found."
        );
        return;
    }

    // Prevent the function from being attached twice
    if (form.dataset.replyReady === "true") {
        return;
    }

    form.dataset.replyReady = "true";

    form.addEventListener("submit", async function (event) {

        event.preventDefault();
        event.stopPropagation();

        const message =
            textarea.value.trim();

        const image =
            selectedImages.admin;

        const activeCustomerEmail =
            getActiveAdminConversationEmail();

        const activeConversationId =
            getActiveAdminConversationId();

        // Must have either text or an image
        if (
            !activeCustomerEmail ||
            (!message && !image)
        ) {
            if (!activeCustomerEmail) {
                alert(
                    "Unable to identify the customer email. Please reopen the conversation and try again."
                );
            }

            return;
        }

        setActiveAdminConversation(
            activeCustomerEmail,
            activeConversationId
        );

        try {

            // ========================================
            // SEND IMAGE
            // ========================================

            if (image) {

                await sendConversationImage(
                    "admin",
                    activeCustomerEmail,
                    "ParcelPro Support",
                    message,
                    image,
                    activeConversationId
                );

                selectedImages.admin = null;

                const imageInput =
                    document.getElementById(
                        "adminImageInput"
                    );

                const imagePreview =
                    document.getElementById(
                        "adminImagePreview"
                    );

                if (imageInput) {
                    imageInput.value = "";
                }

                if (imagePreview) {
                    imagePreview.hidden = true;
                }

            }

            // ========================================
            // SEND TEXT MESSAGE
            // ========================================

            if (message) {

                const response =
                    await fetch(
                        activeConversationId
                            ? "/conversations/by-id/" + activeConversationId + "/reply"
                            : "/conversations/" + encodeURIComponent(activeCustomerEmail) + "/reply",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                message: message
                            })
                        }
                    );

                const data =
                    await response.json();

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to send reply."
                    );

                }

            }

            // Clear reply box
            textarea.value = "";

            // Reload conversation
            await loadAdminConversation(
                activeCustomerEmail,
                activeConversationId
            );

        }

        catch (error) {

            console.error(
                "Admin reply error:",
                error
            );

            alert(
                error.message ||
                "Unable to send reply."
            );

        }

    });

}

// ========================================
// ADMIN ACCOUNT SETTINGS
// ========================================

function setupAdminAccountSettings() {

    const form =
        document.getElementById("adminAccountForm");

    const usernameInput =
        document.getElementById("adminUsername");

    const currentPasswordInput =
        document.getElementById("currentAdminPassword");

    const newPasswordInput =
        document.getElementById("newAdminPassword");

    const confirmPasswordInput =
        document.getElementById("confirmAdminPassword");

    const message =
        document.getElementById("adminAccountMessage");

    const saveButton =
        document.getElementById("saveAdminAccountBtn");

    if (!form || !usernameInput) {
        return;
    }

    if (form.dataset.settingsReady === "true") {
        return;
    }

    form.dataset.settingsReady = "true";


    async function loadAdminAccount() {

        const auth =
            getAdminAuthData();

        if (!auth.token) {
            return;
        }

        try {

            const response =
                await fetch(
                    `/admin-account?sessionId=${encodeURIComponent(auth.sessionId)}&token=${encodeURIComponent(auth.token)}`,
                    {
                        cache: "no-store"
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {

                return;
            }

            usernameInput.value =
                data.username || "";

        }

        catch (error) {

            console.error(
                "Unable to load admin account:",
                error
            );

        }

    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const username =
                usernameInput.value.trim();

            const currentPassword =
                currentPasswordInput.value;

            const newPassword =
                newPasswordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            if (!username) {

                message.textContent =
                    "Please enter an admin username.";

                return;

            }


            if (!currentPassword) {

                message.textContent =
                    "Please enter your current password.";

                return;

            }


            if (
                newPassword &&
                newPassword !== confirmPassword
            ) {

                message.textContent =
                    "New passwords do not match.";

                return;

            }


            if (
                newPassword &&
                newPassword.length < 6
            ) {

                message.textContent =
                    "New password must be at least 6 characters.";

                return;

            }


            const auth =
                getAdminAuthData();

            if (!auth.token) {

                message.textContent =
                    "Your admin session has expired. Please log in again.";

                return;

            }


            saveButton.disabled = true;

            message.textContent =
                "Saving changes...";


            try {

                const response =
                    await fetch(
                        "/admin-account/update",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    sessionId:
                                        auth.sessionId,

                                    token:
                                        auth.token,

                                    username:
                                        username,

                                    currentPassword:
                                        currentPassword,

                                    newPassword:
                                        newPassword

                                })
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to update admin account."
                    );

                }


                usernameInput.value =
                    data.username ||
                    username;

                currentPasswordInput.value =
                    "";

                newPasswordInput.value =
                    "";

                confirmPasswordInput.value =
                    "";


                message.textContent =
                    "✓ Admin account updated successfully.";

            }

            catch (error) {

                console.error(
                    "Admin account update error:",
                    error
                );

                message.textContent =
                    error.message ||
                    "Unable to update admin account.";

            }

            finally {

                saveButton.disabled =
                    false;

            }

        }
    );


    loadAdminAccount();

}

// ========================================
// REAL-TIME PRESENCE (SERVER-AUTHORITATIVE)
// ========================================

let presenceEventSource = null;
let adminPresenceTimer = null;

function getPresenceSessionId() {
    let id =
        sessionStorage.getItem("parcelProPresenceSessionId") ||
        localStorage.getItem("parcelProPresenceSessionId");

    if (!id) {
        id = (
            crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`
        ).slice(0, 96);
    }

    sessionStorage.setItem(
        "parcelProPresenceSessionId",
        id
    );

    localStorage.setItem(
        "parcelProPresenceSessionId",
        id
    );

    return id;
}

function formatPresenceLastSeen(value) {
    if (!value) return "Last seen recently";
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
    if (minutes < 1) return "Last seen just now";
    return `Last seen ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
}

function renderSupportPresence(status) {
    document.querySelectorAll(".agent-info span").forEach(element => {
        const online = Boolean(status && status.online);
        element.textContent = online ? "● Support is Online" : `● Support is Offline · ${formatPresenceLastSeen(status && status.last_seen)}`;
        element.classList.toggle("online", online);
        element.classList.toggle("offline", !online);
    });
}

async function updateSupportOnlineStatus() {
    try {
        const response = await fetch("/support-status", { cache: "no-store" });
        const data = await response.json();
        if (response.ok && data.success) renderSupportPresence(data);
    } catch (error) {
        console.error("Unable to load support presence:", error);
    }
}

function connectPresenceEvents(scope) {
    if (presenceEventSource) presenceEventSource.close();
    let url = "/presence/events?scope=" + scope;
    if (scope === "admin") {
       const auth = getAdminAuthData();
       if (!auth.token) return;
       url += `&sessionId=${encodeURIComponent(auth.sessionId)}&token=${encodeURIComponent(auth.token)}`;
       }
    presenceEventSource = new EventSource(url);
    presenceEventSource.addEventListener("presence", event => {
        try {
            const status = JSON.parse(event.data);
            if (status.type === "support") renderSupportPresence(status);
            if (scope === "admin" && status.type === "customer") refreshCurrentCustomerPresence(status);
        } catch (error) { console.error("Invalid presence update:", error); }
    });
}

async function sendCustomerPresence(action) {
    if (!customerEmail) return;
    const body = { email: customerEmail, name: customerName, sessionId: getPresenceSessionId() };
    try {
        await fetch(`/presence/customer/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: action === "disconnect" });
    } catch (error) {
        console.error("Customer presence update failed:", error);
    }
}

function sendCustomerLogin() { return sendCustomerPresence("connect"); }
function sendCustomerHeartbeat() {
    if (document.visibilityState === "visible" && navigator.onLine) return sendCustomerPresence("heartbeat");
}
function sendCustomerLogout() { return sendCustomerPresence("disconnect"); }

function startAdminPresence() {
    if (!document.getElementById("messagesSection") || localStorage.getItem("isLoggedIn") !== "true") return;
    const token
    =sessionStorage.getItem("parcelProAdminPresenceToken") ||
    localStorage.getItem("parcelProAdminPresenceToken");
    if (!token) return;
    const heartbeat = () => fetch("/presence/admin/heartbeat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: getPresenceSessionId(), token }) }).catch(() => {});
    heartbeat();
    adminPresenceTimer = setInterval(() => { if (document.visibilityState === "visible" && navigator.onLine) heartbeat(); }, 25000);
    connectPresenceEvents("admin");
}

function refreshCurrentCustomerPresence(status) {
    if (status.email !== currentAdminCustomerEmail) return;
    const state = document.querySelector(".conversation-state");
    if (state) {
        const statusText = status.online
            ? "Online"
            : formatPresenceLastSeen(status.lastSeen);

        state.innerHTML = `<span class="support-status-dot ${status.online ? "" : "is-offline"}"></span>${escapeHTML(statusText)}`;
    }
}

async function loadCustomerPresenceInHeader(email) {
    try {
        const response = await fetch("/customer-status/" + encodeURIComponent(email), { cache: "no-store" });
        const data = await response.json();
        const customer = data.customer || {};
        refreshCurrentCustomerPresence({ email, online: Boolean(data.exists && (data.online ?? customer.is_online)), lastSeen: customer.last_seen || customer.logout_at });
    } catch (error) {
        console.error("Unable to load customer presence:", error);
    }
}

function setupLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form || form.dataset.presenceReady) return;
    form.dataset.presenceReady = "true";
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage") || document.getElementById("loginError");
        try {
            const response = await fetch("/presence/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password, sessionId: getPresenceSessionId() }) });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Incorrect username or password.");
            localStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("parcelProAdminPresenceToken", data.presenceToken);
            localStorage.setItem("parcelProAdminPresenceToken",data.presenceToken);
            window.location.href = "dashboard.html";
        } catch (error) {
            if (message) message.textContent = error.message;
        }
    });
}

// ========================================
// INITIALIZE EVERYTHING
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCustomerInformation();

        // ADMIN LOGIN
        setupLoginForm();

        // MOBILE MENU
        setupMobileMenu();

        // LANGUAGE
        setupLanguageSelector();

        // HOME TRACKING
        setupHomeTracking();

        // CUSTOMER CHAT
        setupChatButtons();

        setupChatForm();

        setupImageAttachment("customer");
        setupImageAttachment("admin");
        setupMessageImageLightbox();

        setupQuickQuestions();

        updateSupportOnlineStatus();

        // ADMIN DASHBOARD
        loadDashboardStats();

        loadShipments();

        setupShipmentStatusUpdates();

        setupShipmentForm();

        setupDashboardNavigation();

        setupAdminReplyForm();

        setupAdminAccountSettings();

        setupBackToConversations();

        startAdminAutoRefresh();

        startAdminPresence();
    }
);
