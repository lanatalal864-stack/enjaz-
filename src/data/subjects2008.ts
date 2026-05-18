import type { SubjectConfig } from "../AppCore";

export const subjects2008: SubjectConfig[] = [
  {
    id: "2008_en_adv",
    title: "اللغة الإنجليزية متقدم",
    units: [
      {
        id: "2008_en_adv_u1",
        title: "الفصل الأول",
        lessons: [
          { id: "2008_en_adv_u1_l1", title: "Unit 1" },
          { id: "2008_en_adv_u1_l2", title: "Unit 2" },
          { id: "2008_en_adv_u1_l3", title: "Unit 3" },
          { id: "2008_en_adv_u1_l4", title: "Unit 4" },
        ],
      },
      {
        id: "2008_en_adv_u2",
        title: "الفصل الثاني",
        lessons: [
          { id: "2008_en_adv_u2_l1", title: "Unit 6" },
          { id: "2008_en_adv_u2_l2", title: "Unit 7" },
          { id: "2008_en_adv_u2_l3", title: "Unit 9" },
          { id: "2008_en_adv_u2_l4", title: "Unit 10" },
        ],
      },
    ],
  },
  {
    id: "2008_ar_spec",
    title: "اللغة العربية تخصص",
    units: [
      {
        id: "2008_ar_spec_u1",
        title: "النحو والصرف",
        lessons: [
          { id: "2008_ar_spec_u1_l1", title: "كسر همزة إن" },
          { id: "2008_ar_spec_u1_l2", title: "الجملة الشرطية" },
          { id: "2008_ar_spec_u1_l3", title: "الإبدال" },
          { id: "2008_ar_spec_u1_l4", title: "التصغير" },
        ],
      },
      {
        id: "2008_ar_spec_u2",
        title: "القضايا الأدبية",
        lessons: [
          { id: "2008_ar_spec_u2_l1", title: "الأدب في العصر الأندلسي" },
          { id: "2008_ar_spec_u2_l2", title: "الأدب في العصرين الأيوبي والمملوكي" },
        ],
      },
      {
        id: "2008_ar_spec_u3",
        title: "البلاغة العربية والنقد",
        lessons: [
          { id: "2008_ar_spec_u3_l1", title: "علم المعاني" },
          { id: "2008_ar_spec_u3_l2", title: "علم البديع" },
        ],
      },
    ],
  },
  {
    id: "2008_bio",
    title: "الأحياء",
    units: [
      {
        id: "2008_bio_u1",
        title: "الوحدة الأولى: كيمياء الحياة",
        lessons: [
          { id: "2008_bio_u1_l1", title: "المركبات العضوية الحيوية" },
          { id: "2008_bio_u1_l2", title: "الإنزيمات وجزيئات حفظ الطاقة" },
        ],
      },
      {
        id: "2008_bio_u2",
        title: "الوحدة الثانية: دورة الخلية وتصنيع البروتين",
        lessons: [
          { id: "2008_bio_u2_l1", title: "دورة الخلية" },
          { id: "2008_bio_u2_l2", title: "تضاعف DNA وتصنيع البروتين" },
        ],
      },
      {
        id: "2008_bio_u3",
        title: "الوحدة الثالثة: الوراثة",
        lessons: [
          { id: "2008_bio_u3_l1", title: "وراثة الصفات" },
          { id: "2008_bio_u3_l2", title: "الطفرات وتأثيراتها" },
        ],
      },
    ],
  },
  {
    id: "2008_chem",
    title: "الكيمياء",
    units: [
      {
        id: "2008_chem_u1",
        title: "الوحدة الأولى: الحموض والقواعد",
        lessons: [
          { id: "2008_chem_u1_l1", title: "مفاهيم الحموض والقواعد" },
          { id: "2008_chem_u1_l2", title: "الرقم الهيدروجيني ومحاليل الحموض والقواعد" },
          { id: "2008_chem_u1_l3", title: "المعايرة والاتزان" },
        ],
      },
      {
        id: "2008_chem_u2",
        title: "الوحدة الثانية: التأكسد والاختزال والخلايا الغلفانية",
        lessons: [
          { id: "2008_chem_u2_l1", title: "تفاعلات التأكسد والاختزال" },
          { id: "2008_chem_u2_l2", title: "الخلايا الغلفانية" },
        ],
      },
      {
        id: "2008_chem_u3",
        title: "الوحدة الثالثة: سرعة التفاعلات الكيميائية",
        lessons: [
          { id: "2008_chem_u3_l1", title: "مفهوم سرعة التفاعل" },
          { id: "2008_chem_u3_l2", title: "قوانين سرعة التفاعل ورتبته" },
        ],
      },
      {
        id: "2008_chem_u4",
        title: "الوحدة الرابعة: الكيمياء العضوية",
        lessons: [
          { id: "2008_chem_u4_l1", title: "تفاعلات المركبات العضوية" },
          { id: "2008_chem_u4_l2", title: "تحضير المركبات العضوية" },
        ],
      },
    ],
  },
  {
    id: "2008_phys",
    title: "الفيزياء",
    units: [
      {
        id: "2008_phys_u1",
        title: "الوحدة الأولى: الزخم الخطي والتصادمات",
        lessons: [
          { id: "2008_phys_u1_l1", title: "الزخم الخطي والدفع" },
          { id: "2008_phys_u1_l2", title: "التصادمات" },
        ],
      },
      {
        id: "2008_phys_u2",
        title: "الوحدة الثانية: الحركة الدورانية",
        lessons: [
          { id: "2008_phys_u2_l1", title: "ديناميكا الحركة الدورانية" },
          { id: "2008_phys_u2_l2", title: "الزخم الزاوي" },
        ],
      },
      {
        id: "2008_phys_u3",
        title: "الوحدة الثالثة: التيار الكهربائي",
        lessons: [
          { id: "2008_phys_u3_l1", title: "التيار والمقاومة" },
          { id: "2008_phys_u3_l2", title: "القدرة والدارة البسيطة" },
          { id: "2008_phys_u3_l3", title: "قاعدتا كيرتشوف" },
        ],
      },
      {
        id: "2008_phys_u4",
        title: "الوحدة الرابعة: المجال المغناطيسي",
        lessons: [
          { id: "2008_phys_u4_l1", title: "القوة المغناطيسية" },
          { id: "2008_phys_u4_l2", title: "المجال المغناطيسي الناشئ عن تيار" },
        ],
      },
    ],
  },
  {
    id: "2008_math_adv",
    title: "الرياضيات المتقدم",
    units: [
      {
        id: "2008_math_adv_u1",
        title: "الوحدة الأولى: التفاضل",
        lessons: [
          { id: "2008_math_adv_u1_l1", title: "الاشتقاق" },
          { id: "2008_math_adv_u1_l2", title: "مشتقتا الضرب والقسمة" },
          { id: "2008_math_adv_u1_l3", title: "قاعدة السلسلة" },
          { id: "2008_math_adv_u1_l4", title: "الاشتقاق الضمني" },
        ],
      },
      {
        id: "2008_math_adv_u2",
        title: "الوحدة الثانية: تطبيقات التفاضل",
        lessons: [
          { id: "2008_math_adv_u2_l1", title: "المعدلات المرتبطة بالزمن" },
          { id: "2008_math_adv_u2_l2", title: "تطبيقات القيم القصوى" },
        ],
      },
      {
        id: "2008_math_adv_u3",
        title: "الوحدة الثالثة: الأعداد المركبة",
        lessons: [
          { id: "2008_math_adv_u3_l1", title: "الأعداد المركبة والعمليات عليها" },
          { id: "2008_math_adv_u3_l2", title: "المحل الهندسي" },
        ],
      },
      {
        id: "2008_math_adv_u4",
        title: "الوحدة الرابعة: التكامل وتطبيقاته",
        lessons: [
          { id: "2008_math_adv_u4_l1", title: "التكامل غير المحدود" },
          { id: "2008_math_adv_u4_l2", title: "التكامل المحدود" },
          { id: "2008_math_adv_u4_l3", title: "تقنيات التكامل" },
          { id: "2008_math_adv_u4_l4", title: "تطبيقات التكامل (المساحة والحجم)" },
        ],
      },
    ],
  },
  {
    id: "2008_bus_math",
    title: "رياضيات الأعمال",
    units: [
      {
        id: "2008_bus_math_u1",
        title: "الوحدة الأولى",
        lessons: [
          { id: "2008_bus_math_u1_l1", title: "الدرس الأول" },
          { id: "2008_bus_math_u1_l2", title: "الدرس الثاني" },
          { id: "2008_bus_math_u1_l3", title: "الدرس الثالث" },
        ],
      },
      {
        id: "2008_bus_math_u2",
        title: "الوحدة الثانية",
        lessons: [
          { id: "2008_bus_math_u2_l1", title: "الدرس الأول" },
          { id: "2008_bus_math_u2_l2", title: "الدرس الثاني" },
        ],
      },
    ]
  },
  {
    id: "2008_earth",
    title: "علوم الأرض",
    units: [
      {
        id: "2008_earth_u1",
        title: "الوحدة الأولى: بنية الأرض",
        lessons: [
          { id: "2008_earth_u1_l1", title: "طبقات الأرض" },
          { id: "2008_earth_u1_l2", title: "نظرية تكتونية الصفائح" },
        ]
      },
      {
        id: "2008_earth_u2",
        title: "الوحدة الثانية: موارد الأرض",
        lessons: [
          { id: "2008_earth_u2_l1", title: "الموارد المعدنية والطاقة" },
          { id: "2008_earth_u2_l2", title: "التجوية والتعرية" },
        ]
      }
    ]
  },
  {
    id: "2008_hist_spec",
    title: "تاريخ الأردن تخصص",
    units: [
      {
        id: "2008_hist_spec_u1",
        title: "الوحدة الأولى",
        lessons: [
          { id: "2008_hist_spec_u1_l1", title: "الفصل الأول" },
          { id: "2008_hist_spec_u1_l2", title: "الفصل الثاني" },
        ]
      },
      {
        id: "2008_hist_spec_u2",
        title: "الوحدة الثانية",
        lessons: [
          { id: "2008_hist_spec_u2_l1", title: "الفصل الأول" },
          { id: "2008_hist_spec_u2_l2", title: "الفصل الثاني" },
        ]
      }
    ]
  },
  {
    id: "2008_islamic_spec",
    title: "التربية الإسلامية تخصص",
    units: [
      {
        id: "2008_islamic_spec_u1",
        title: "الوحدة الأولى",
        lessons: [
          { id: "2008_islamic_spec_u1_l1", title: "الدرس الثقافي الأول" },
          { id: "2008_islamic_spec_u1_l2", title: "الدرس الثقافي الثاني" },
        ]
      }
    ]
  },
  {
    id: "2008_psych",
    title: "علم النفس والاجتماع",
    units: [
      {
        id: "2008_psych_u1",
        title: "الوحدة الأولى: أساسيات علم النفس",
        lessons: [
          { id: "2008_psych_u1_l1", title: "مدخل إلى علم النفس" },
          { id: "2008_psych_u1_l2", title: "مناهج البحث في علم النفس" },
        ]
      },
      {
        id: "2008_psych_u2",
        title: "الوحدة الثانية: علم الاجتماع",
        lessons: [
          { id: "2008_psych_u2_l1", title: "المفاهيم الاجتماعية الأساسية" },
          { id: "2008_psych_u2_l2", title: "التغير الاجتماعي" },
        ]
      }
    ]
  },
  {
    id: "2008_geo",
    title: "الجغرافيا",
    units: [
      {
        id: "2008_geo_u1",
        title: "الوحدة الأولى: الجغرافيا الطبيعية",
        lessons: [
          { id: "2008_geo_u1_l1", title: "المناخ والنبات الطبيعي" },
          { id: "2008_geo_u1_l2", title: "التضاريس والمياه" },
        ]
      },
      {
        id: "2008_geo_u2",
        title: "الوحدة الثانية: الجغرافيا البشرية والاقتصادية",
        lessons: [
          { id: "2008_geo_u2_l1", title: "السكان والعمران" },
          { id: "2008_geo_u2_l2", title: "الموارد الاقتصادية" },
        ]
      }
    ]
  }
];
