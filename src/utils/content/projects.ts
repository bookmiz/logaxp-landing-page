const projects = [
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
];

export default projects;
