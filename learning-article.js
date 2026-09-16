/* Article content and chart data are deliberately separate from the planning catalogue.
   Data sources and qualifications are visible beside each chart and in the references. */
const housingLearningSources = {
  "energy": "https://energy-information.canada.ca/en/energy-facts/energy-efficiency",
  "envelope": "https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/keeping-heat-section-2-your-house-works",
  "trial": "https://doi.org/10.1136/bmj.39070.573032.80",
  "health": "https://www.who.int/publications/i/item/9789241550376",
  "materials": "https://doi.org/10.1038/s41467-023-40302-0",
  "climate": "https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-9/",
  "lca": "https://publications.gc.ca/site/fra/9.908801/publication.html",
  "embodied": "https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32814"
};

function housingSource(key, label) {
  return `<a href="${housingLearningSources[key]}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

const housingLearningCopy = {
  "en": {
    "eyebrow": "Learning / Sustainable housing",
    "title": "Why is sustainable housing important?",
    "deck": "Sustainable housing uses materials, energy and design to support health, comfort and affordability over the life of a home.",
    "meta": "EverDwell editorial · 7 September 2026 · 6-minute read",
    "introduction": "<p>A home is not sustainable because it contains one product labelled “green.” Its performance emerges from a system: walls and windows influence heating demand; insulation and air sealing affect comfort and moisture; structural and finish materials shape repair and replacement. <a href=\"https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/keeping-heat-section-2-your-house-works\" target=\"_blank\" rel=\"noopener noreferrer\">[2]</a> <a href=\"https://www.who.int/publications/i/item/9789241550376\" target=\"_blank\" rel=\"noopener noreferrer\">[3]</a> <a href=\"https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-9/\" target=\"_blank\" rel=\"noopener noreferrer\">[6]</a></p><p>Sustainable housing brings energy, health, material use, durability and affordability into the same decision. Meaningful comparisons must consider the job a product performs, how long it lasts and how it interacts with the home.</p>",
    "energyTitle": "Energy efficiency begins with material performance",
    "energyText": "<p>In Canada, space and water heating accounted for 79% of residential energy consumption in 2023. This is an energy-use statistic, not a carbon-emissions share, but it shows why the building envelope matters. Insulation slows heat transfer, air barriers reduce leakage, and windows connect thermal performance with daylight and ventilation. Together, the envelope influences how much energy a home needs for comfort. <a href=\"https://energy-information.canada.ca/en/energy-facts/energy-efficiency\" target=\"_blank\" rel=\"noopener noreferrer\">[1]</a> <a href=\"https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/keeping-heat-section-2-your-house-works\" target=\"_blank\" rel=\"noopener noreferrer\">[2]</a></p>",
    "energyAfter": "<p>Lower demand can reduce purchased energy, but no material guarantees a particular saving. Climate, installation, equipment and household behaviour affect the result. Low-cost insulation that performs poorly after moisture damage may be less economical than a better-suited product.</p>",
    "energyChartTitle": "Where does home energy go?",
    "energyChartSub": "Canada · Residential energy consumption · 2023",
    "heating": "Space and water heating",
    "other": "All other uses",
    "heatingNote": "Warm rooms and hot water",
    "otherNote": "Appliances, lighting and cooling",
    "energyAlt": "Space and water heating: 79% of Canadian residential energy use. Other uses: 21%.",
    "energyCaption": "Figure 1. <a href=\"https://energy-information.canada.ca/en/energy-facts/energy-efficiency\" target=\"_blank\" rel=\"noopener noreferrer\">Canadian Centre for Energy Information, Energy Fact Book, Spring 2026</a>. Other uses = 100% − 79%. This is energy use, not the share of carbon emissions.",
    "healthTitle": "Healthy housing requires a balanced envelope",
    "healthText": "<p>Energy efficiency and health can improve together. The World Health Organization’s housing guidelines connect indoor temperature, air quality and other housing conditions with health and quality of life. <a href=\"https://www.who.int/publications/i/item/9789241550376\" target=\"_blank\" rel=\"noopener noreferrer\">[3]</a> A New Zealand cluster-randomised trial involving 1,350 households gives more specific evidence: homes receiving an insulation package used less energy and had slightly warmer winter bedrooms than comparison homes. <a href=\"https://pubmed.ncbi.nlm.nih.gov/17324975/\" target=\"_blank\" rel=\"noopener noreferrer\">[4]</a></p>",
    "trialChartTitle": "Less energy. Warmer bedrooms.",
    "trialChartSub": "New Zealand insulation trial · Published 2007",
    "trialControl": "Uninsulated comparison homes",
    "trialInsulated": "Homes receiving insulation",
    "trialAxis": "Relative household energy use · Comparison group = 100",
    "trialCallout": "+0.5°C",
    "trialCalloutLabel": "winter bedroom temperature",
    "trialAlt": "Comparison homes: energy index 100. Insulated homes: adjusted energy index 81, with a 95% confidence interval of 72 to 91. Winter bedrooms were 0.5 degrees Celsius warmer.",
    "trialCaption": "Figure 2. <a href=\"https://doi.org/10.1136/bmj.39070.573032.80\" target=\"_blank\" rel=\"noopener noreferrer\">Howden-Chapman and colleagues, BMJ (2007)</a>. Energy use is adjusted for baseline usage; the interval is 72–91. These are study results, not guaranteed savings for another home.",
    "healthAfter": "<p>The trial shows that envelope improvements can produce co-benefits, but its effect size should not be transferred directly to Canadian homes. It involved low-income New Zealand communities and uninsulated homes where at least one resident had respiratory symptoms or a history of them. It also tested a package rather than every insulation product. Airtightness needs ventilation and moisture control. Holding heat inside while allowing pollutants or humidity to accumulate would exchange one problem for another. <a href=\"https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/keeping-heat-section-2-your-house-works\" target=\"_blank\" rel=\"noopener noreferrer\">[2]</a></p>",
    "materialsTitle": "Material impacts continue beyond the utility bill",
    "materialsText": "<p>A home’s environmental impact begins before occupancy. Concrete, timber, glass, insulation and finishes require raw materials, manufacturing and transport. Maintenance, replacement and disposal add further impacts. Under the scenarios modelled in a global concrete study, the amount used, structural design and service life all affected future demand and emissions. Durability alone does not prove that a product has the lowest footprint. <a href=\"https://doi.org/10.1038/s41467-023-40302-0\" target=\"_blank\" rel=\"noopener noreferrer\">[5]</a></p><p>The same reasoning applies to everyday choices. A floor should be judged by the quantity required, expected life, repairability and suitability for moisture and wear. Insulation should be compared at the same thermal performance. A window with higher manufacturing impacts may still reduce whole-life impacts if it delivers sufficient energy savings for long enough; the result depends on climate, orientation, installation and the local energy supply.</p><p>Canada’s whole-building life-cycle guidance aims to make these comparisons more consistent by aligning boundaries, material quantities and assumptions. <a href=\"https://publications.gc.ca/site/fra/9.908801/publication.html\" target=\"_blank\" rel=\"noopener noreferrer\">[7]</a> Environmental Product Declarations can disclose a product’s modelled impacts, and Canada’s federal embodied-carbon standard uses EPDs or project life-cycle assessment to document certain structural materials. <a href=\"https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32814\" target=\"_blank\" rel=\"noopener noreferrer\">[8]</a> An EPD is evidence, not a green award. Two products should be compared only when they provide equivalent service and their data cover compatible life-cycle stages.</p>",
    "futureTitle": "Affordability and access are part of sustainability",
    "futureText": "<p>Long-term performance changes the meaning of cost. Purchase price matters, but so do energy bills, maintenance, repair and replacement. Some improvements may lower operating costs; others may be worthwhile mainly because they improve comfort, resilience or health. Claims that every upgrade “pays for itself” hide differences in climate, financing, energy prices and the condition of the home.</p><p>Costs and benefits may also fall on different people. Tenants may pay energy bills without controlling upgrades; owners may pay for work while occupants receive the comfort benefit. Sustainable housing therefore includes access and distribution. The WHO and IPCC connect better housing with health, well-being and climate resilience while recognising that solutions must fit local conditions. <a href=\"https://www.who.int/publications/i/item/9789241550376\" target=\"_blank\" rel=\"noopener noreferrer\">[3]</a> <a href=\"https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-9/\" target=\"_blank\" rel=\"noopener noreferrer\">[6]</a></p>",
    "conclusionTitle": "What the evidence supports, and what it implies",
    "conclusion": "<p>The evidence directly supports several conclusions: envelope performance can reduce heating demand; housing conditions affect health; material quantity and service life influence environmental impacts; and fair comparisons require consistent functions and life-cycle boundaries. It does not identify one universally sustainable material or predict the outcome of a particular renovation.</p><p>A broader conclusion follows from combining these findings. The most sustainable choice is the material-and-design solution that meets the home’s safety, health and performance needs with the lowest credible whole-life burden at a cost people can carry. This is an evidence-based synthesis rather than a result reported by one source. Better local product data, realistic service-life estimates and clearer evidence about maintenance and occupant behaviour are still needed. Sustainable housing is important because it makes those relationships visible before a short-term choice becomes a decades-long consequence.</p>",
    "sourcesTitle": "Sources & further reading",
    "sourceLabels": [
      [
        "energy",
        "Canadian Centre for Energy Information (2026). Energy Fact Book, Spring 2026: Energy efficiency.",
        "Canadian data for Figure 1."
      ],
      [
        "envelope",
        "Natural Resources Canada. Keeping the Heat In: How your house works.",
        "Heat flow, the building envelope, moisture and ventilation."
      ],
      [
        "health",
        "World Health Organization (2018). WHO Housing and health guidelines.",
        "Evidence-based guidance on housing conditions and health."
      ],
      [
        "trial",
        "Howden-Chapman et al. (2007). Effect of insulating existing houses on health inequality. BMJ, 334, 460.",
        "Cluster-randomised community study; Figure 2 uses reported adjusted results."
      ],
      [
        "materials",
        "Olsson, Miller & Alexander (2023). Near-term pathways for decarbonizing global concrete production. Nature Communications, 14, 4574.",
        "Material efficiency, structural design and service-life modelling."
      ],
      [
        "climate",
        "IPCC (2022). Climate Change 2022: Mitigation of Climate Change, Chapter 9: Buildings.",
        "Long-term building decisions, well-being and climate mitigation."
      ],
      [
        "lca",
        "National Research Council Canada (2022). National guidelines for whole-building life cycle assessment.",
        "Consistent scope, quantities and assumptions for building life-cycle comparisons."
      ],
      [
        "embodied",
        "Treasury Board of Canada Secretariat. Standard on Embodied Carbon in Construction.",
        "Canadian federal requirements for verified embodied-carbon disclosure."
      ]
    ],
    "methods": "About this article: an educational synthesis of the sources above, not a new experiment or a home-specific assessment. Charts are redrawn from published data. Examples illustrate the reasoning; outcomes depend on the home and local conditions.",
    "back": "Back to home"
  },
  "fr": {
    "eyebrow": "Comprendre / Habitat durable",
    "title": "Pourquoi l’habitat durable est-il important ?",
    "deck": "L’habitat durable mobilise les matériaux, l’énergie et la conception pour favoriser la santé, le confort et l’accessibilité financière pendant toute la vie d’un logement.",
    "meta": "Rédaction EverDwell · 7 septembre 2026 · Lecture de 7 minutes",
    "introduction": "<p>Un logement n’est pas durable simplement parce qu’il contient un produit étiqueté « vert ». Sa performance résulte d’un système : les murs et les fenêtres influencent les besoins de chauffage ; l’isolation et l’étanchéité à l’air agissent sur le confort et l’humidité ; les matériaux de structure et de finition déterminent les besoins de réparation et de remplacement. <a href=\"https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/keeping-heat-section-2-your-house-works\" target=\"_blank\" rel=\"noopener noreferrer\">[2]</a> <a href=\"https://www.who.int/publications/i/item/9789241550376\" target=\"_blank\" rel=\"noopener noreferrer\">[3]</a> <a href=\"https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-9/\" target=\"_blank\" rel=\"noopener noreferrer\">[6]</a></p><p>L’habitat durable réunit l’énergie, la santé, l’utilisation des matériaux, la durabilité et l’accessibilité financière dans une même décision. Une comparaison pertinente doit tenir compte de la fonction d’un produit, de sa durée de service et de ses interactions avec le logement.</p>",
    "energyTitle": "L’efficacité énergétique commence par la performance des matériaux",
    "energyText": "<p>Au Canada, le chauffage des locaux et de l’eau représentait 79 % de la consommation énergétique résidentielle en 2023. Cette statistique porte sur l’énergie consommée, et non sur la part des émissions de carbone, mais elle montre l’importance de l’enveloppe du bâtiment. L’isolation ralentit les transferts de chaleur, les pare-air réduisent les fuites et les fenêtres associent performance thermique, lumière naturelle et ventilation. Ensemble, les éléments de l’enveloppe influencent la quantité d’énergie nécessaire au confort. <a href=\"https://energy-information.canada.ca/en/energy-facts/energy-efficiency\" target=\"_blank\" rel=\"noopener noreferrer\">[1]</a> <a href=\"https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/keeping-heat-section-2-your-house-works\" target=\"_blank\" rel=\"noopener noreferrer\">[2]</a></p>",
    "energyAfter": "<p>Une demande moindre peut réduire l’énergie achetée, mais aucun matériau ne garantit une économie précise. Le climat, la pose, les équipements et les habitudes du ménage influencent le résultat. Un isolant peu coûteux dont la performance se dégrade sous l’effet de l’humidité peut être moins économique qu’un produit mieux adapté.</p>",
    "energyChartTitle": "Où va l’énergie de nos logements ?",
    "energyChartSub": "Canada · Consommation énergétique résidentielle · 2023",
    "heating": "Chauffage des locaux et de l’eau",
    "other": "Autres usages",
    "heatingNote": "Des pièces chauffées et de l’eau chaude",
    "otherNote": "Appareils, éclairage et climatisation",
    "energyAlt": "Chauffage des locaux et de l’eau : 79 % de l’énergie résidentielle au Canada. Autres usages : 21 %.",
    "energyCaption": "Figure 1. <a href=\"https://energy-information.canada.ca/en/energy-facts/energy-efficiency\" target=\"_blank\" rel=\"noopener noreferrer\">Centre canadien d’information sur l’énergie, Cahier d’information sur l’énergie, printemps 2026</a>. Autres usages = 100 % − 79 %. Il s’agit d’énergie consommée, et non de la part des émissions de carbone.",
    "healthTitle": "Un habitat sain exige une enveloppe équilibrée",
    "healthText": "<p>L’efficacité énergétique et la santé peuvent s’améliorer ensemble. Les lignes directrices de l’Organisation mondiale de la Santé sur le logement relient la température intérieure, la qualité de l’air et d’autres conditions de logement à la santé et à la qualité de vie. <a href=\"https://www.who.int/publications/i/item/9789241550376\" target=\"_blank\" rel=\"noopener noreferrer\">[3]</a> Un essai néo-zélandais randomisé par grappes, portant sur 1 350 ménages, apporte des éléments plus précis : les logements ayant bénéficié d’un ensemble de travaux d’isolation consommaient moins d’énergie et leurs chambres étaient légèrement plus chaudes en hiver que celles des logements témoins. <a href=\"https://pubmed.ncbi.nlm.nih.gov/17324975/\" target=\"_blank\" rel=\"noopener noreferrer\">[4]</a></p>",
    "trialChartTitle": "Moins d’énergie. Des chambres plus chaudes.",
    "trialChartSub": "Étude sur l’isolation en Nouvelle-Zélande · Publication en 2007",
    "trialControl": "Logements témoins non isolés",
    "trialInsulated": "Logements ayant reçu une isolation",
    "trialAxis": "Consommation énergétique relative · Groupe témoin = 100",
    "trialCallout": "+0,5 °C",
    "trialCalloutLabel": "température des chambres en hiver",
    "trialAlt": "Logements témoins : indice énergétique 100. Logements isolés : indice ajusté 81, avec un intervalle de confiance à 95 % de 72 à 91. Les chambres étaient plus chaudes de 0,5 degré Celsius en hiver.",
    "trialCaption": "Figure 2. <a href=\"https://doi.org/10.1136/bmj.39070.573032.80\" target=\"_blank\" rel=\"noopener noreferrer\">Howden-Chapman et ses collègues, BMJ (2007)</a>. La consommation énergétique est ajustée selon l’usage initial ; l’intervalle est de 72 à 91. Il s’agit de résultats d’étude, et non d’économies garanties pour un autre logement.",
    "healthAfter": "<p>L’essai montre que l’amélioration de l’enveloppe peut apporter plusieurs bénéfices, mais l’ampleur de ses effets ne doit pas être transposée directement aux logements canadiens. Il concernait des collectivités néo-zélandaises à faible revenu et des logements non isolés où au moins un occupant présentait des symptômes respiratoires ou en avait déjà présenté. Il évaluait également un ensemble de travaux, et non chaque produit isolant. L’étanchéité à l’air doit s’accompagner d’une ventilation et d’une maîtrise de l’humidité. Retenir la chaleur tout en laissant s’accumuler les polluants ou l’humidité reviendrait à remplacer un problème par un autre. <a href=\"https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/keeping-heat-section-2-your-house-works\" target=\"_blank\" rel=\"noopener noreferrer\">[2]</a></p>",
    "materialsTitle": "Les impacts des matériaux dépassent la facture énergétique",
    "materialsText": "<p>L’impact environnemental d’un logement commence avant son occupation. Le béton, le bois, le verre, l’isolation et les finitions nécessitent des matières premières, de la fabrication et du transport. L’entretien, le remplacement et l’élimination ajoutent d’autres impacts. Dans les scénarios modélisés par une étude mondiale sur le béton, les quantités utilisées, la conception des structures et leur durée de service influençaient toutes la demande et les émissions futures. La durabilité seule ne prouve pas qu’un produit possède l’empreinte la plus faible. <a href=\"https://doi.org/10.1038/s41467-023-40302-0\" target=\"_blank\" rel=\"noopener noreferrer\">[5]</a></p><p>Le même raisonnement s’applique aux choix courants. Un revêtement de sol doit être évalué selon la quantité nécessaire, sa durée de vie prévue, sa réparabilité et son adaptation à l’humidité et à l’usure. Les isolants doivent être comparés à performance thermique égale. Une fenêtre dont la fabrication a davantage d’impacts peut néanmoins réduire les impacts sur l’ensemble du cycle de vie si elle permet des économies d’énergie suffisantes pendant assez longtemps ; le résultat dépend du climat, de l’orientation, de la pose et de l’approvisionnement énergétique local.</p><p>Les lignes directrices canadiennes sur l’analyse du cycle de vie des bâtiments visent à rendre ces comparaisons plus cohérentes en harmonisant les périmètres, les quantités de matériaux et les hypothèses. <a href=\"https://publications.gc.ca/site/fra/9.908801/publication.html\" target=\"_blank\" rel=\"noopener noreferrer\">[7]</a> Les déclarations environnementales de produits peuvent présenter les impacts modélisés d’un produit, et la norme fédérale canadienne sur le carbone intrinsèque utilise ces déclarations ou une analyse du cycle de vie du projet pour documenter certains matériaux de structure. <a href=\"https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32814\" target=\"_blank\" rel=\"noopener noreferrer\">[8]</a> Une déclaration environnementale de produit constitue un élément d’information, pas un label écologique. Deux produits ne devraient être comparés que s’ils rendent un service équivalent et si leurs données couvrent des étapes compatibles du cycle de vie.</p>",
    "futureTitle": "L’accessibilité financière et l’accès font partie de la durabilité",
    "futureText": "<p>La performance à long terme change la manière d’évaluer les coûts. Le prix d’achat compte, mais les factures d’énergie, l’entretien, les réparations et le remplacement comptent aussi. Certaines améliorations peuvent réduire les dépenses de fonctionnement ; d’autres peuvent être utiles surtout parce qu’elles améliorent le confort, la résilience ou la santé. Affirmer que toute amélioration « s’autofinance » masque les différences de climat, de financement, de prix de l’énergie et d’état du logement.</p><p>Les coûts et les bénéfices peuvent aussi concerner des personnes différentes. Les locataires peuvent payer les factures d’énergie sans décider des améliorations ; les propriétaires peuvent financer les travaux tandis que les occupants bénéficient d’un meilleur confort. L’habitat durable inclut donc les questions d’accès et de répartition. L’OMS et le GIEC associent un meilleur logement à la santé, au bien-être et à la résilience climatique, tout en reconnaissant que les solutions doivent être adaptées aux conditions locales. <a href=\"https://www.who.int/publications/i/item/9789241550376\" target=\"_blank\" rel=\"noopener noreferrer\">[3]</a> <a href=\"https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-9/\" target=\"_blank\" rel=\"noopener noreferrer\">[6]</a></p>",
    "conclusionTitle": "Ce que les données étayent et ce qu’elles impliquent",
    "conclusion": "<p>Les données étayent directement plusieurs conclusions : la performance de l’enveloppe peut réduire les besoins de chauffage ; les conditions de logement influencent la santé ; la quantité de matériaux et leur durée de service influencent les impacts environnementaux ; et une comparaison équitable exige des fonctions et des périmètres de cycle de vie cohérents. Elles ne désignent pas un matériau universellement durable et ne prédisent pas le résultat d’une rénovation particulière.</p><p>Une conclusion plus générale découle du rapprochement de ces constats. Le choix le plus durable est la combinaison de matériaux et de conception qui répond aux besoins de sécurité, de santé et de performance du logement avec la charge environnementale la plus faible, évaluée de manière crédible sur l’ensemble du cycle de vie, à un coût que les personnes peuvent assumer. Il s’agit d’une synthèse fondée sur les données, et non d’un résultat rapporté par une seule source. De meilleures données locales sur les produits, des estimations réalistes de leur durée de service et des connaissances plus précises sur l’entretien et le comportement des occupants restent nécessaires. L’habitat durable est important parce qu’il rend ces relations visibles avant qu’un choix à court terme n’entraîne des conséquences pendant des décennies.</p>",
    "sourcesTitle": "Sources et lectures complémentaires",
    "sourceLabels": [
      [
        "energy",
        "Centre canadien d’information sur l’énergie (2026). Cahier d’information sur l’énergie, printemps 2026 : efficacité énergétique.",
        "Données canadiennes utilisées pour la figure 1."
      ],
      [
        "envelope",
        "Ressources naturelles Canada. Emprisonnons la chaleur : le fonctionnement de votre maison.",
        "Transferts de chaleur, enveloppe du bâtiment, humidité et ventilation."
      ],
      [
        "health",
        "Organisation mondiale de la Santé (2018). Lignes directrices relatives au logement et à la santé.",
        "Recommandations fondées sur les données probantes."
      ],
      [
        "trial",
        "Howden-Chapman et ses collègues (2007). Effets de l’isolation des logements existants sur les inégalités de santé. BMJ, 334, 460.",
        "Étude communautaire randomisée par grappes ; la figure 2 utilise les résultats ajustés publiés."
      ],
      [
        "materials",
        "Olsson, Miller et Alexander (2023). Voies de décarbonation à court terme de la production mondiale de béton. Nature Communications, 14, 4574.",
        "Efficacité matérielle, conception des structures et modélisation de la durée de service."
      ],
      [
        "climate",
        "GIEC (2022). Changement climatique 2022 : atténuation du changement climatique, chapitre 9 : bâtiments.",
        "Choix à long terme, bien-être et atténuation."
      ],
      [
        "lca",
        "Conseil national de recherches Canada (2022). Lignes directrices nationales en matière d’analyse du cycle de vie de l’ensemble du bâtiment.",
        "Cohérence des périmètres, des quantités et des hypothèses pour comparer les cycles de vie des bâtiments."
      ],
      [
        "embodied",
        "Secrétariat du Conseil du Trésor du Canada. Norme sur le carbone intrinsèque en construction.",
        "Exigences fédérales canadiennes de divulgation vérifiée du carbone intrinsèque."
      ]
    ],
    "methods": "À propos : synthèse pédagogique des sources ci-dessus, et non nouvelle expérience ou évaluation d’un logement particulier. Graphiques réalisés à partir des données publiées. Les exemples illustrent le raisonnement ; les résultats dépendent du logement et du contexte local. Les liens donnent accès aux publications originales, dont certaines sont en anglais.",
    "back": "Retour à l’accueil"
  }
};

function housingEnergyChart(c, lang) {
  const percent = n => lang === 'fr' ? `${n} %` : `${n}%`;
  return `<figure class="learning-figure"><header><span class="learning-chart-number">01</span><div><h3>${c.energyChartTitle}</h3><p>${c.energyChartSub}</p></div></header>
    <div class="learning-donut-layout"><svg class="learning-donut" viewBox="0 0 240 240" role="img" aria-labelledby="housing-energy-chart-title"><title id="housing-energy-chart-title">${c.energyAlt}</title><circle cx="120" cy="120" r="94" fill="none" stroke="#dce1d7" stroke-width="27"/><circle cx="120" cy="120" r="94" fill="none" stroke="#246b59" stroke-width="27" pathLength="100" stroke-dasharray="79 21" transform="rotate(-90 120 120)"/><text x="120" y="135" text-anchor="middle" fill="#173d36" font-size="45" font-weight="650">${percent(79)}</text></svg>
    <div class="learning-chart-legend"><div><span class="learning-chart-key heating"></span><p><strong>${percent(79)} · ${c.heating}</strong><small>${c.heatingNote}</small></p></div><div><span class="learning-chart-key other"></span><p><strong>${percent(21)} · ${c.other}</strong><small>${c.otherNote}</small></p></div></div></div><figcaption>${c.energyCaption}</figcaption></figure>`;
}

function housingTrialChart(c) {
  // Baseline-adjusted ratio 0.81 (95% CI 0.72–0.91), BMJ 2007 Table 4.
  // The control is indexed to 100; this is not a before/after comparison.
  return `<figure class="learning-figure"><header><span class="learning-chart-number">02</span><div><h3>${c.trialChartTitle}</h3><p>${c.trialChartSub}</p></div></header>
    <div class="learning-trial" role="img" aria-label="${c.trialAlt}"><p class="learning-axis-caption">${c.trialAxis}</p>
      <div class="learning-bar-label">${c.trialControl}<b>100</b></div><div class="learning-bar-track"><div class="learning-bar control" style="width:100%"></div></div>
      <div class="learning-bar-label">${c.trialInsulated}<b>81</b></div><div class="learning-bar-track"><div class="learning-bar insulated" style="width:81%"></div><span class="learning-confidence" style="left:72%;width:19%"></span></div>
      <div class="learning-chart-axis"><span>0</span><span>50</span><span>100</span></div>
      <div class="learning-temperature"><strong>${c.trialCallout}</strong><span>${c.trialCalloutLabel}</span></div>
    </div><figcaption>${c.trialCaption}</figcaption></figure>`;
}

function renderSustainableHousingArticle(lang) {
  const c = housingLearningCopy[lang === 'fr' ? 'fr' : 'en'];
  const container = document.querySelector('#sustainable-housing-content');
  container.innerHTML = `<header class="learning-story-header"><span class="learning-eyebrow">${c.eyebrow}</span><h1 id="sustainable-housing-title">${c.title}</h1><p class="learning-deck">${c.deck}</p><p class="learning-meta">${c.meta}</p></header>
    <div class="learning-prose">${c.introduction}
      <section><h2>${c.energyTitle}</h2>${c.energyText}${housingEnergyChart(c, lang)}${c.energyAfter}</section>
      <section><h2>${c.healthTitle}</h2>${c.healthText}${housingTrialChart(c)}${c.healthAfter}</section>
      <section><h2>${c.materialsTitle}</h2>${c.materialsText}</section>
      <section><h2>${c.futureTitle}</h2>${c.futureText}</section>
      <section><h2>${c.conclusionTitle}</h2>${c.conclusion}</section>
      <section class="learning-sources"><h2>${c.sourcesTitle}</h2><ol>${c.sourceLabels.map(([key, title, note]) => `<li>${housingSource(key, title)}<p>${note}</p></li>`).join('')}</ol><p class="learning-methods">${c.methods}</p></section>
      <button type="button" class="back-link" data-route="home">← ${c.back}</button>
    </div>`;
}
