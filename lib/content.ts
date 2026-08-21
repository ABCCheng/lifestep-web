import type { JourneyType, LifeScenario, LifeStage, ScenarioDetail } from "./types";
import type { Locale } from "./i18n";

export const stageMeta: Record<LifeStage, { icon: string; title: string; translated: Partial<Record<Locale, string>>; description: string; translatedDescription: Partial<Record<Locale, string>> }> = {
  ARRIVE: { icon: "🛬", title: "Arrive in Canada", translated: { en: "Arrive in Canada", "zh-Hans": "抵达加拿大", fr: "Arriver au Canada", es: "Llegar a Canadá" }, description: "Welcome to Canada. Take your first confident steps.", translatedDescription: { en: "Welcome to Canada. Take your first confident steps.", "zh-Hans": "欢迎来到加拿大，从容迈出第一步。", fr: "Bienvenue au Canada. Faites vos premiers pas avec confiance.", es: "Bienvenido a Canadá. Da tus primeros pasos con confianza." } },
  GET_SETTLED: { icon: "🧾", title: "Get Settled", translated: { en: "Get Settled", "zh-Hans": "安顿下来", fr: "S'installer", es: "Instalarse" }, description: "Handle the essentials and begin your new life.", translatedDescription: { en: "Handle the essentials and begin your new life.", "zh-Hans": "办好生活必需事项，开启新生活。", fr: "Réglez l'essentiel et commencez votre nouvelle vie.", es: "Resuelve lo esencial y comienza tu nueva vida." } },
  HOUSING: { icon: "🏠", title: "Find a Home", translated: { en: "Find a Home", "zh-Hans": "寻找住房", fr: "Trouver un logement", es: "Encontrar un hogar" }, description: "Find a place to call home.", translatedDescription: { en: "Find a place to call home.", "zh-Hans": "找到一个可以称为家的地方。", fr: "Trouvez un endroit où vous sentir chez vous.", es: "Encuentra un lugar al que llamar hogar." } },
  FINANCES: { icon: "🏦", title: "Set Up Your Finances", translated: { en: "Set Up Your Finances", "zh-Hans": "建立金融生活", fr: "Organiser ses finances", es: "Organizar tus finanzas" }, description: "Build confidence managing money in Canada.", translatedDescription: { en: "Build confidence managing money in Canada.", "zh-Hans": "自信管理在加拿大的财务生活。", fr: "Gérez votre argent au Canada en toute confiance.", es: "Gestiona tu dinero en Canadá con confianza." } },
  LIFE_SETUP: { icon: "📱", title: "Set Up Your Life", translated: { en: "Set Up Your Life", "zh-Hans": "建立生活", fr: "Organiser sa vie", es: "Organizar tu vida" }, description: "Connect the services that keep daily life moving.", translatedDescription: { en: "Connect the services that keep daily life moving.", "zh-Hans": "连接日常生活所需的各项服务。", fr: "Connectez les services utiles au quotidien.", es: "Conecta los servicios necesarios para el día a día." } },
  TRANSPORTATION: { icon: "🚇", title: "Get Around", translated: { en: "Get Around", "zh-Hans": "交通出行", fr: "Se déplacer", es: "Moverse" }, description: "Explore your city with confidence.", translatedDescription: { en: "Explore your city with confidence.", "zh-Hans": "自信探索你的城市。", fr: "Explorez votre ville en toute confiance.", es: "Explora tu ciudad con confianza." } },
  HEALTHCARE: { icon: "🏥", title: "Healthcare", translated: { en: "Healthcare", "zh-Hans": "医疗健康", fr: "Soins de santé", es: "Atención médica" }, description: "Get the care you need and explain how you feel.", translatedDescription: { en: "Get the care you need and explain how you feel.", "zh-Hans": "获得所需医疗服务，并准确表达感受。", fr: "Obtenez les soins nécessaires et expliquez vos symptômes.", es: "Obtén la atención que necesitas y explica cómo te sientes." } },
  SCHOOL_CHILDCARE: { icon: "🏫", title: "School & Childcare", translated: { en: "School & Childcare", "zh-Hans": "学校与育儿", fr: "École et garde d'enfants", es: "Escuela y cuidado infantil" }, description: "Support your family at school and daycare.", translatedDescription: { en: "Support your family at school and daycare.", "zh-Hans": "在学校和托儿所支持你的家人。", fr: "Accompagnez votre famille à l'école et à la garderie.", es: "Apoya a tu familia en la escuela y la guardería." } },
  EVERYDAY_LIFE: { icon: "🛒", title: "Everyday Life", translated: { en: "Everyday Life", "zh-Hans": "日常生活", fr: "Vie quotidienne", es: "Vida cotidiana" }, description: "Handle daily errands with ease.", translatedDescription: { en: "Handle daily errands with ease.", "zh-Hans": "轻松处理日常生活事务。", fr: "Gérez facilement les tâches du quotidien.", es: "Resuelve tus tareas diarias con facilidad." } },
  FIND_JOB: { icon: "💼", title: "Find a Job", translated: { en: "Find a Job", "zh-Hans": "寻找工作", fr: "Trouver un emploi", es: "Encontrar trabajo" }, description: "Tell your story and start your career.", translatedDescription: { en: "Tell your story and start your career.", "zh-Hans": "讲好你的故事，开启职业生涯。", fr: "Racontez votre parcours et lancez votre carrière.", es: "Cuenta tu historia y comienza tu carrera." } },
  WORK_GROW: { icon: "💰", title: "Work & Grow", translated: { en: "Work & Grow", "zh-Hans": "工作与成长", fr: "Travailler et évoluer", es: "Trabajar y crecer" }, description: "Communicate clearly and grow at work.", translatedDescription: { en: "Communicate clearly and grow at work.", "zh-Hans": "清晰沟通，在职场持续成长。", fr: "Communiquez clairement et progressez au travail.", es: "Comunícate con claridad y crece en el trabajo." } },
  COMMUNITY: { icon: "🌎", title: "Build Your Community", translated: { en: "Build Your Community", "zh-Hans": "融入加拿大", fr: "Créer sa communauté", es: "Crear tu comunidad" }, description: "Connect, contribute, and feel at home.", translatedDescription: { en: "Connect, contribute, and feel at home.", "zh-Hans": "建立连接、参与社区，找到归属感。", fr: "Créez des liens, contribuez et sentez-vous chez vous.", es: "Conecta, contribuye y siéntete como en casa." } },
};

export const journeyOrders: Record<JourneyType, LifeStage[]> = {
  STUDY: ["ARRIVE", "GET_SETTLED", "HOUSING", "FINANCES", "LIFE_SETUP", "TRANSPORTATION", "SCHOOL_CHILDCARE", "HEALTHCARE", "EVERYDAY_LIFE", "FIND_JOB", "WORK_GROW", "COMMUNITY"],
  WORK: ["ARRIVE", "GET_SETTLED", "HOUSING", "FIND_JOB", "FINANCES", "LIFE_SETUP", "TRANSPORTATION", "HEALTHCARE", "EVERYDAY_LIFE", "WORK_GROW", "SCHOOL_CHILDCARE", "COMMUNITY"],
  FAMILY: ["ARRIVE", "GET_SETTLED", "HOUSING", "SCHOOL_CHILDCARE", "HEALTHCARE", "FINANCES", "LIFE_SETUP", "TRANSPORTATION", "EVERYDAY_LIFE", "FIND_JOB", "WORK_GROW", "COMMUNITY"],
};

const scenarioTitles: Record<LifeStage, Array<[string, string]>> = {
  ARRIVE: [["Immigration Inspection", "入境检查"], ["Customs Declaration", "海关申报"], ["Baggage Claim", "领取行李"], ["Lost Luggage", "行李丢失"], ["Airport Transportation", "机场交通"], ["Check-in at Temporary Accommodation", "入住临时住宿"]],
  GET_SETTLED: [["Apply for a SIN", "申请社会保险号"], ["Apply for a Health Card", "申请健康卡"], ["Visit a Settlement Centre", "前往安置服务中心"], ["Set Up a Phone Plan", "办理手机套餐"], ["Learn About Emergency Services", "了解紧急服务"]],
  HOUSING: [["Search for an Apartment", "寻找公寓"], ["Contact a Landlord", "联系房东"], ["Book an Apartment Viewing", "预约看房"], ["Submit a Rental Application", "提交租房申请"], ["Sign a Lease", "签署租约"], ["Report a Maintenance Issue", "报告维修问题"]],
  FINANCES: [["Open a Bank Account", "开立银行账户"], ["Apply for a Credit Card", "申请信用卡"], ["Send an Interac e-Transfer", "使用电子转账"], ["Pay Your Bills", "支付账单"], ["File Your First Tax Return", "第一次报税"]],
  LIFE_SETUP: [["Buy a SIM Card", "购买 SIM 卡"], ["Set Up Home Internet", "安装家庭网络"], ["Buy Furniture & Essentials", "购买家具和生活用品"], ["Learn Recycling Rules", "了解垃圾分类规则"]],
  TRANSPORTATION: [["Use Public Transit", "乘坐公共交通"], ["Get a PRESTO Card", "办理 PRESTO 卡"], ["Ask for Directions", "问路"], ["Use Uber & Taxi", "乘坐网约车与出租车"], ["Get Car Insurance", "购买汽车保险"]],
  HEALTHCARE: [["Find a Family Doctor", "寻找家庭医生"], ["Book a Medical Appointment", "预约看诊"], ["Describe Your Symptoms", "描述症状"], ["Pick Up Medication", "领取药物"], ["Visit the Emergency Room", "前往急诊室"]],
  SCHOOL_CHILDCARE: [["Find a Daycare", "寻找托儿所"], ["Register for School", "学校注册"], ["Talk to a Teacher", "与老师交谈"], ["Parent-Teacher Meeting", "家长会"], ["Report Your Child's Absence", "为孩子请假"]],
  EVERYDAY_LIFE: [["Grocery Shopping", "超市购物"], ["Order Coffee", "点咖啡"], ["Eat at a Restaurant", "餐厅用餐"], ["Return or Exchange an Item", "退换商品"], ["Call Customer Service", "致电客服"]],
  FIND_JOB: [["Prepare Your Resume", "准备简历"], ["Search for Jobs", "寻找职位"], ["Write a Cover Letter", "撰写求职信"], ["Schedule an Interview", "预约面试"], ["Job Interview", "工作面试"], ["Accept a Job Offer", "接受录用通知"]],
  WORK_GROW: [["Your First Day at Work", "入职第一天"], ["Meet Your Team", "认识团队"], ["Join a Meeting", "参加会议"], ["Ask for Help", "寻求帮助"], ["Request Time Off", "申请休假"], ["Workplace Small Talk", "职场闲聊"]],
  COMMUNITY: [["Meet Your Neighbours", "认识邻居"], ["Get a Library Card", "办理图书馆卡"], ["Join Community Programs", "参加社区活动"], ["Volunteer", "参与志愿服务"], ["Make New Friends", "结交新朋友"]],
};

export function mockScenarios(stage: LifeStage): LifeScenario[] {
  return scenarioTitles[stage].map(([title, langTitle], index) => ({
    id: Object.keys(stageMeta).indexOf(stage) * 20 + index + 1,
    title,
    langTitle,
    description: `Practice a natural conversation for “${title}” and learn what to expect.`,
    langDescription: `通过自然对话练习“${langTitle}”，提前了解真实场景。`,
    progressStatus: index === 0 ? "IN_PROGRESS" : index < 2 ? "COMPLETED" : "NOT_STARTED",
  }));
}

export function mockScenarioDetail(id: number): ScenarioDetail {
  return {
    scenarioId: id,
    knowledgeList: [
      { id: 1, title: "Before you start", langTitle: "开始之前", content: "Keep your passport, study or work permit, and Canadian address ready. Answer clearly and only provide what the officer asks for.", langContent: "准备好护照、学习或工作许可，以及加拿大地址。清楚回答，只提供官员询问的信息。" },
      { id: 2, title: "A useful Canadian habit", langTitle: "实用的加拿大沟通习惯", content: "A short greeting and a calm, direct answer sound polite and confident. It is always okay to ask someone to repeat a question.", langContent: "简短问候加上冷静直接的回答，会显得礼貌而自信。没听清时，可以请对方重复。" },
    ],
    vocabularyList: [
      { id: 1, term: "purpose of your visit", langTerm: "来访目的", pronunciation: "/ˈpɜːrpəs əv jʊr ˈvɪzɪt/" },
      { id: 2, term: "study permit", langTerm: "学习许可", pronunciation: "/ˈstʌdi ˈpɜːrmɪt/" },
      { id: 3, term: "temporary address", langTerm: "临时住址", pronunciation: "/ˈtempəreri əˈdres/" },
      { id: 4, term: "Could you repeat that?", langTerm: "可以请您再说一遍吗？", pronunciation: "/kʊd ju rɪˈpiːt ðæt/" },
    ],
    conversationList: [
      { id: 1, speaker: "OFFICER", message: "Good afternoon. Welcome to Canada.", langMessage: "下午好，欢迎来到加拿大。" },
      { id: 2, speaker: "YOU", message: "Thank you. Good afternoon.", langMessage: "谢谢，下午好。" },
      { id: 3, speaker: "OFFICER", message: "What is the purpose of your visit?", langMessage: "您此次来访的目的是什么？" },
      { id: 4, speaker: "YOU", message: "I'm here to study at a college in Toronto.", langMessage: "我来多伦多的一所学院学习。" },
      { id: 5, speaker: "OFFICER", message: "May I see your study permit and admission letter?", langMessage: "可以看一下您的学习许可和录取通知书吗？" },
      { id: 6, speaker: "YOU", message: "Of course. Here they are.", langMessage: "当然，可以，给您。" },
    ],
    review: {
      summary: "You practised greeting an officer, explaining your purpose, and presenting your documents clearly.",
      keyPhrases: ["I'm here to…", "May I see…?", "Here they are.", "Could you repeat that?"],
      takeaway: "Keep answers short, calm, and specific. You can always ask for clarification.",
    },
  };
}
