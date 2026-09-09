const projects = [
  {
    title: "Hearken",
    motionStyle: "scripture" as const,
    description: "Bring the Word into the room. Hearken connects scripture search, spoken-reference suggestions, live scenes and shared service preparation in a church media desk. Operators review passages privately and decide what appears on the congregation’s screen.",
    categories: [],
    link: "https://hearkenlive.com/",
    tags: ["ChurchMedia", "ScriptureProjection", "ServicePreparation", "OperatorControl"],
    scenes: [
      { src: "/images/hearken-desk.png", alt: "Hearken desktop with scripture search, private preview and audience output" },
      { src: "/images/hearken-royal.png", alt: "Royal scripture presentation from Hearken" },
      { src: "/images/hearken-aurora.png", alt: "Aurora scripture presentation from Hearken" },
    ],
  },
  {
    title: "GatherPlux",
    motionStyle: "events" as const,
    description:
      "Discover experiences worth coming together for. GatherPlux helps organizers publish events, sell tickets, and manage guests, while attendees explore events and book their next experience. From event pages and QR passes to check-in and insights, keep the details connected.",
    categories: [],
    link: "https://www.gatherplux.com/",
    tags: [
      "PluxYourEvents",
      "SmartEventPlanning",
      "UnleashGatherPlux",
      "FutureOfEvents",
    ],
    scenes: [
      { src: "/images/gatherplux-concert.jpg", alt: "Concert experiences from the GatherPlux gallery" },
      { src: "/images/gatherplux-wedding.jpg", alt: "Wedding celebrations from the GatherPlux gallery" },
      { src: "/images/gatherplux-music.jpg", alt: "Live music from the GatherPlux gallery" },
    ],
  },
  {
    title: "BookMiz",
    motionStyle: "beauty" as const,
    description:
      "Book beauty and professional services with confidence. BookMiz helps customers discover providers, compare quotes, and book appointments. Businesses can manage services, bookings, teams, and client relationships in one workspace.",
    categories: [],
    link: "https://www.bookmiz.com/",
    scenes: [
      { src: "/images/bookmiz-manicure.png", alt: "Manicure service featured on BookMiz" },
      { src: "/images/bookmiz-facial.png", alt: "Facial treatment featured on BookMiz" },
      { src: "/images/bookmiz-barber.jpg", alt: "Barber service featured on BookMiz" },
    ],
    tags: [
      "BookMizMagic",
      "EffortlessBookings",
      "BusinessBookingPro",
      "SmartScheduleNow",
    ],
  },
  {
    title: "HireAFixer",
    motionStyle: "craft" as const,
    description:
      "Find the right help for your home or business. HireAFixer connects customers with professionals for repairs, installations, maintenance, and cleaning. Compare profiles, request quotes, and keep project conversations organized in one place.",
    categories: [],
    links: "https://www.hireafixer.com/",
    tags: ["HireAFixer", "HomeServices", "CompareQuotes", "RepairsAndCleaning"],
    scenes: [
      { src: "/images/hireafixer-workshop.png", alt: "Roof repair featured on HireAFixer" },
      { src: "/images/hireafixer-kitchen.png", alt: "Kitchen interior featured on HireAFixer" },
      { src: "/images/hireafixer-project.png", alt: "Workshop featured on HireAFixer" },
    ],
  },
  {
    title: "LogaDash",
    motionStyle: "delivery" as const,
    description:
      "Food, delivery, and restaurant operations in one platform. LogaDash connects customers, restaurants, and riders with tools to discover meals, manage orders, coordinate kitchens, and track deliveries. Dedicated experiences keep every step connected, from ordering to doorstep delivery.",
    categories: [],
    links: "https://www.logadash.com/",
    tags: ["FoodDelivery", "RestaurantOperations", "KitchenManagement", "RiderNetwork"],
    scenes: [
      { src: "/images/logadash-customer.png", alt: "Customer ordering food with LogaDash" },
      { src: "/images/logadash-kitchen.png", alt: "Restaurant kitchen preparing an order" },
      { src: "/images/logadash-delivery.png", alt: "LogaDash rider delivering an order" },
    ],
  },
  {
    title: "Flospay",
    motionStyle: "finance" as const,
    description: "Save together. Pay simply. Flospay brings group savings (esusu), payments, transfers and shareable payment links into one app. Organize savings circles around shared goals and keep everyday money activity in view.",
    categories: [],
    link: "https://flospay.com/",
    tags: ["GroupSavings", "Esusu", "Payments", "PaymentLinks"],
    scenes: [
      { src: "/images/flospay-dashboard.png", alt: "Dashboard preview featured on Flospay" },
      { src: "/images/flospay-phone.png", alt: "Mobile app preview featured on Flospay" },
      { src: "/images/flospay-map.png", alt: "Community payments illustration featured on Flospay" },
    ],
  },
  {
    title: "Patvero",
    motionStyle: "collaboration" as const,
    description: "Keep conversations connected to the work that follows. Patvero brings meetings, bookings, documents, project boards and team messaging into one collaboration workspace, with decisions and next steps close at hand.",
    categories: [],
    link: "https://www.patvero.com/",
    tags: ["Meetings", "TeamCollaboration", "Bookings", "ProjectDelivery"],
    scenes: [
      { src: "/images/patvero-remote.webp", alt: "Remote collaboration imagery featured on Patvero" },
      { src: "/images/patvero-decisions.webp", alt: "Team reviewing meeting outcomes, featured on Patvero" },
      { src: "/images/patvero-team.webp", alt: "Leadership planning imagery featured on Patvero" },
    ],
  },
  {
    title: "OmoFlow",
    motionStyle: "workspace" as const,
    description: "Connect meetings with everyday team operations. OmoFlow brings task boards, attendance, approvals, payroll workflows and team communication into a shared workspace, helping teams follow work from discussion to delivery.",
    categories: [],
    link: "https://www.omoflow.com/",
    tags: ["TeamOperations", "TaskBoards", "Attendance", "Approvals"],
    scenes: [
      { src: "/images/omoflow-workspace.webp", alt: "Workspace imagery featured on OmoFlow" },
    ],
  },
];

export default projects;
