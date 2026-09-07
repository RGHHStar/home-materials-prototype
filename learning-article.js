/* Article content and chart data are deliberately separate from the planning catalogue.
   Data sources and qualifications are visible beside each chart and in the references. */
const housingLearningSources = {
  energy: 'https://energy-information.canada.ca/en/energy-facts/energy-efficiency',
  envelope: 'https://natural-resources.canada.ca/energy-efficiency/home-energy-efficiency/keeping-heat-section-2-your-house-works',
  trial: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1808149/',
  health: 'https://www.who.int/publications/i/item/9789241550376',
  materials: 'https://www.nature.com/articles/s41467-023-40302-0',
  climate: 'https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-9/'
};

function housingSource(key, label) {
  return `<a href="${housingLearningSources[key]}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

const housingLearningCopy = {
  en: {
    eyebrow: 'Learning / Sustainable housing',
    title: 'Why is sustainable housing important?',
    deck: 'Sustainable housing connects environmental responsibility with health, comfort and long-term affordability.',
    meta: 'EverDwell editorial · 7 September 2026 · 6-minute read',
    introduction: `<p>Housing provides essential shelter, but its performance also influences energy demand, indoor conditions and household expenditure. Poor heat retention, for example, can increase the energy required to maintain comfortable temperatures. A single building characteristic can therefore have environmental, social and economic consequences.</p><p>Sustainable housing considers these dimensions together. It aims to provide safe, healthy and affordable living conditions while limiting resource consumption and environmental impacts throughout a building’s life.</p><p>Its importance cannot be assessed through carbon emissions alone. Energy efficiency, occupant well-being, material durability and long-term costs are interconnected. Examining these relationships helps explain why sustainable housing is relevant both to environmental protection and to quality of life.</p>`,
    energyTitle: 'Energy efficiency and thermal comfort',
    energyText: `<p>In Canada, space and water heating accounted for <strong>79% of residential energy consumption in 2023</strong>. Keeping rooms warm and supplying hot water dominate the household energy picture. ${housingSource('energy', '[1]')}</p>`,
    energyAfter: `<p>Improving thermal comfort does not necessarily require greater heating capacity. Insulation slows heat transfer, and air sealing reduces unwanted leakage. The walls, roof, windows and foundation form the <em>building envelope</em>: the boundary between indoors and outdoors. Improving its performance can reduce the energy needed to maintain comfortable indoor temperatures. ${housingSource('envelope', '[2]')}</p><p>Lower purchased energy consumption can reduce operating costs, although savings depend on energy prices, building characteristics and patterns of use. Improvements also require an initial investment. A meaningful cost comparison therefore considers purchase, operation and maintenance over time, rather than the purchase price alone.</p>`,
    energyChartTitle: 'Where does home energy go?',
    energyChartSub: 'Canada · Residential energy consumption · 2023',
    heating: 'Space and water heating', other: 'All other uses',
    heatingNote: 'Warm rooms and hot water', otherNote: 'Appliances, lighting and cooling',
    energyAlt: 'Space and water heating: 79% of Canadian residential energy use. Other uses: 21%.',
    energyCaption: `Figure 1. ${housingSource('energy', 'Canadian Centre for Energy Information, Energy Fact Book, Spring 2026')}. Other uses = 100% − 79%. This is energy use, not the share of carbon emissions.`,
    healthTitle: 'Housing quality and occupant health',
    healthText: `<p>The World Health Organization treats housing as a health issue, addressing cold, overheating, crowding, accessibility and other hazards. Indoor environmental conditions are therefore an important consideration in housing design and assessment, rather than an optional aspect of comfort. ${housingSource('health', '[3]')}</p><p>A New Zealand randomised study of <strong>1,350 households</strong> tested an insulation retrofit package. The intervention group used less energy and had slightly warmer bedrooms. This was a study of selected low-income communities, not a prediction for Canadian homes. ${housingSource('trial', '[4]')}</p>`,
    trialChartTitle: 'Less energy. Warmer bedrooms.',
    trialChartSub: 'New Zealand insulation trial · Published 2007',
    trialControl: 'Uninsulated comparison homes', trialInsulated: 'Homes receiving insulation',
    trialAxis: 'Relative household energy use · Comparison group = 100',
    trialCallout: '+0.5°C', trialCalloutLabel: 'winter bedroom temperature',
    trialAlt: 'Comparison homes: energy index 100. Insulated homes: adjusted energy index 81, with a 95% confidence interval of 72 to 91. Winter bedrooms were 0.5 degrees Celsius warmer.',
    trialCaption: `Figure 2. ${housingSource('trial', 'Howden-Chapman and colleagues, BMJ (2007)')}. Energy use adjusted for baseline usage; the line marks the 95% confidence interval (72–91). Study results, not guaranteed savings.`,
    healthAfter: `<p>These findings illustrate that lower energy consumption and improved indoor conditions can occur together. They do not establish a uniform outcome for all insulation projects; the results must be interpreted in their study context.</p><p>Increased airtightness alone does not establish that a home is healthier. Moisture control and appropriate ventilation must be considered alongside heat retention to manage indoor air and humidity. ${housingSource('envelope', '[2]')}</p>`,
    materialsTitle: 'Resource use and material service life',
    materialsText: `<p>A home’s environmental impact extends beyond its operating energy. Concrete, timber, glass and finishes also require resources. Products with a low initial cost may require frequent replacement, while longer-lasting alternatives may reduce repeated material demand.</p><p>Research on concrete decarbonisation examines material production, structural design and service life together. In its modelling, extending useful life can reduce demand for new cement-based materials. This is not proof that every durable product has the lowest footprint, but it explains why longevity belongs in an environmental comparison. ${housingSource('materials', '[5]')}</p><p>Flooring illustrates this distinction. Its raw materials should be evaluated alongside moisture resistance, repairability and suitability for the intended space. Premature failure can create additional replacement needs. An environmental comparison should therefore consider performance over the product’s service life, rather than relying solely on an environmental label.</p>`,
    futureTitle: 'Long-term performance and affordability',
    futureText: `<p>Major building components, including walls and roofs, represent long-term decisions. The IPCC warns that low-ambition building choices can lock in emissions for decades. It also links better buildings with well-being and adaptation, not only carbon reduction. ${housingSource('climate', '[6]')}</p><p>Sustainable housing therefore involves equity as well as technology. A low purchase price does not necessarily imply affordable operating costs. Tenants may be responsible for energy bills while having limited authority to replace windows or heating equipment. Housing decisions should account for how costs and benefits are distributed, as well as whether improvements are financially accessible.</p>`,
    conclusionTitle: 'Integrating environmental and social objectives',
    conclusion: `<p>Taken together, the evidence supports an integrated approach to sustainable housing. Heat retention, ventilation, energy supply, material durability and affordability should be assessed as interacting parts of a building, rather than as isolated features.</p><p>For existing housing, this involves identifying performance limitations and evaluating appropriate improvements. For new housing, it requires considering these relationships during design. Both approaches share the objective of providing safe, comfortable living conditions while reducing avoidable resource use over the building’s lifetime.</p><p class="learning-closing">The value of sustainable housing lies in its capacity to reduce environmental pressures while supporting occupant well-being and long-term affordability.</p>`,
    sourcesTitle: 'Sources & further reading',
    sourceLabels: [
      ['energy', 'Canadian Centre for Energy Information (2026). Energy Fact Book, Spring 2026: Energy efficiency.', 'Canadian data for Figure 1.'],
      ['envelope', 'Natural Resources Canada. Keeping the Heat In: How your house works.', 'Heat flow, the building envelope and ventilation.'],
      ['health', 'World Health Organization (2018). WHO Housing and health guidelines.', 'Evidence-based guidance on housing conditions and health.'],
      ['trial', 'Howden-Chapman et al. (2007). Effect of insulating existing houses on health inequality. BMJ, 334, 460.', 'Randomised community study; Figure 2 uses reported adjusted results.'],
      ['materials', 'Olsson, Miller & Alexander (2023). Near-term pathways for decarbonizing global concrete production. Nature Communications, 14, 4574.', 'Material efficiency, design and service-life modelling.'],
      ['climate', 'IPCC (2022). Climate Change 2022: Mitigation of Climate Change, Chapter 9: Buildings.', 'Long-term building decisions, well-being and climate mitigation.']
    ],
    methods: 'About this article: an educational synthesis of the sources above, not a new experiment or a home-specific assessment. Charts are redrawn from published data. Examples illustrate the reasoning; outcomes depend on the home and local conditions.',
    back: 'Back to home'
  },
  fr: {
    eyebrow: 'Comprendre / Habitat durable',
    title: 'Pourquoi l’habitat durable est-il important ?',
    deck: 'L’habitat durable associe responsabilité environnementale, santé, confort et accessibilité financière à long terme.',
    meta: 'Rédaction EverDwell · 7 septembre 2026 · Lecture de 7 minutes',
    introduction: `<p>Le logement fournit un abri essentiel, mais sa performance influence aussi la demande énergétique, les conditions intérieures et les dépenses des ménages. Une mauvaise conservation de la chaleur, par exemple, peut augmenter l’énergie nécessaire au maintien de températures confortables. Une même caractéristique du bâtiment peut donc avoir des conséquences environnementales, sociales et économiques.</p><p>L’habitat durable considère ces dimensions conjointement. Il vise à offrir des conditions de vie sûres, saines et abordables tout en limitant la consommation de ressources et les impacts environnementaux pendant la durée de vie du bâtiment.</p><p>Son importance ne peut pas être évaluée uniquement à partir des émissions de carbone. L’efficacité énergétique, le bien-être des occupants, la durabilité des matériaux et les coûts à long terme sont liés. Examiner ces relations permet de comprendre le rôle de l’habitat durable dans la protection de l’environnement et la qualité de vie.</p>`,
    energyTitle: 'Efficacité énergétique et confort thermique',
    energyText: `<p>Au Canada, le chauffage des locaux et de l’eau représentait <strong>79 % de la consommation énergétique résidentielle en 2023</strong>. Chauffer les pièces et fournir de l’eau chaude constituent donc l’essentiel des besoins énergétiques du logement. ${housingSource('energy', '[1]')}</p>`,
    energyAfter: `<p>Améliorer le confort thermique ne nécessite pas forcément une capacité de chauffage supérieure. L’isolation ralentit les transferts de chaleur et l’étanchéisation réduit les fuites d’air indésirables. Les murs, le toit, les fenêtres et les fondations forment l’<em>enveloppe du bâtiment</em>, la limite entre l’intérieur et l’extérieur. Améliorer sa performance peut réduire l’énergie nécessaire au maintien de températures intérieures confortables. ${housingSource('envelope', '[2]')}</p><p>Une consommation moindre d’énergie achetée peut réduire les dépenses de fonctionnement, mais les économies dépendent des tarifs, des caractéristiques du bâtiment et de son utilisation. Les améliorations nécessitent aussi un investissement initial. Une comparaison pertinente considère donc l’achat, le fonctionnement et l’entretien dans le temps, plutôt que le seul prix d’achat.</p>`,
    energyChartTitle: 'Où va l’énergie de nos logements ?',
    energyChartSub: 'Canada · Consommation énergétique résidentielle · 2023',
    heating: 'Chauffage des locaux et de l’eau', other: 'Autres usages',
    heatingNote: 'Des pièces chauffées et de l’eau chaude', otherNote: 'Appareils, éclairage et climatisation',
    energyAlt: 'Chauffage des locaux et de l’eau : 79 % de l’énergie résidentielle au Canada. Autres usages : 21 %.',
    energyCaption: `Figure 1. ${housingSource('energy', 'Centre canadien d’information sur l’énergie, Cahier d’information sur l’énergie, printemps 2026')}. Autres usages = 100 % − 79 %. Il s’agit d’énergie consommée, et non de la part des émissions de carbone.`,
    healthTitle: 'Qualité du logement et santé des occupants',
    healthText: `<p>L’Organisation mondiale de la Santé considère le logement comme un enjeu de santé : froid, surchauffe, surpeuplement, accessibilité et autres risques. Les conditions environnementales intérieures constituent donc un critère important de conception et d’évaluation du logement, et non un simple élément facultatif de confort. ${housingSource('health', '[3]')}</p><p>Une étude randomisée néo-zélandaise portant sur <strong>1 350 ménages</strong> a évalué un ensemble de travaux d’isolation. Le groupe bénéficiaire consommait moins d’énergie et disposait de chambres légèrement plus chaudes. Ces résultats concernent des collectivités à faible revenu sélectionnées pour l’étude ; ils ne prédisent pas les résultats au Canada. ${housingSource('trial', '[4]')}</p>`,
    trialChartTitle: 'Moins d’énergie. Des chambres plus chaudes.',
    trialChartSub: 'Étude sur l’isolation en Nouvelle-Zélande · Publication en 2007',
    trialControl: 'Logements témoins non isolés', trialInsulated: 'Logements ayant reçu une isolation',
    trialAxis: 'Consommation énergétique relative · Groupe témoin = 100',
    trialCallout: '+0,5 °C', trialCalloutLabel: 'température des chambres en hiver',
    trialAlt: 'Logements témoins : indice énergétique 100. Logements isolés : indice ajusté 81, avec un intervalle de confiance à 95 % de 72 à 91. Les chambres étaient plus chaudes de 0,5 degré Celsius en hiver.',
    trialCaption: `Figure 2. ${housingSource('trial', 'Howden-Chapman et ses collègues, BMJ (2007)')}. Consommation ajustée selon l’usage initial ; le trait indique l’intervalle de confiance à 95 % (72–91). Résultats d’étude, et non économies garanties.`,
    healthAfter: `<p>Ces résultats montrent qu’une consommation énergétique moindre et de meilleures conditions intérieures peuvent être obtenues simultanément. Ils n’établissent pas un résultat uniforme pour tous les travaux d’isolation et doivent être interprétés dans le contexte de l’étude.</p><p>Une étanchéité accrue ne suffit pas à établir qu’un logement est plus sain. La maîtrise de l’humidité et une ventilation appropriée doivent être considérées conjointement avec la conservation de la chaleur pour gérer l’air intérieur et l’humidité. ${housingSource('envelope', '[2]')}</p>`,
    materialsTitle: 'Utilisation des ressources et durée de service des matériaux',
    materialsText: `<p>L’impact environnemental d’un logement ne se limite pas à l’énergie consommée pendant son utilisation. Le béton, le bois, le verre et les finitions nécessitent aussi des ressources. Des produits peu coûteux à l’achat peuvent exiger des remplacements fréquents, tandis que des solutions plus durables peuvent réduire ces besoins répétés.</p><p>Des recherches sur la décarbonation du béton étudient ensemble la production des matériaux, la conception des structures et leur durée de service. Dans leurs modèles, prolonger la durée d’utilisation peut réduire la demande de nouveaux matériaux à base de ciment. Cela ne prouve pas que tout produit résistant possède l’empreinte la plus faible, mais explique pourquoi la longévité compte. ${housingSource('materials', '[5]')}</p><p>Les revêtements de sol illustrent cette distinction. Leurs matières premières doivent être évaluées avec leur résistance à l’humidité, leur réparabilité et leur adaptation à l’espace prévu. Une défaillance prématurée peut entraîner des remplacements supplémentaires. La comparaison environnementale doit donc considérer la performance pendant la durée de service du produit, plutôt que sa seule étiquette environnementale.</p>`,
    futureTitle: 'Performance et accessibilité financière à long terme',
    futureText: `<p>Les principaux éléments du bâtiment, notamment les murs et les toits, représentent des choix à long terme. Le GIEC souligne que des choix insuffisamment ambitieux peuvent maintenir des émissions pendant des décennies. Il relie aussi l’amélioration des bâtiments au bien-être et à l’adaptation, pas uniquement à la réduction du carbone. ${housingSource('climate', '[6]')}</p><p>L’habitat durable implique donc l’équité autant que la technologie. Un prix d’achat faible ne garantit pas des coûts de fonctionnement abordables. Les locataires peuvent payer les factures d’énergie tout en ayant peu de pouvoir sur le remplacement des fenêtres ou du chauffage. Les décisions doivent tenir compte de la répartition des coûts et des bénéfices, ainsi que de l’accessibilité financière des améliorations.</p>`,
    conclusionTitle: 'Intégrer les objectifs environnementaux et sociaux',
    conclusion: `<p>Pris ensemble, les résultats appuient une approche intégrée de l’habitat durable. Conservation de la chaleur, ventilation, approvisionnement énergétique, durabilité des matériaux et accessibilité financière doivent être évalués comme des composantes liées du bâtiment, plutôt que comme des caractéristiques isolées.</p><p>Pour le parc existant, cela implique de repérer les limites de performance et d’évaluer les améliorations appropriées. Pour les nouveaux logements, ces relations doivent être considérées dès la conception. Les deux approches visent des conditions de vie sûres et confortables tout en réduisant la consommation évitable de ressources pendant la durée de vie du bâtiment.</p><p class="learning-closing">L’intérêt de l’habitat durable réside dans sa capacité à réduire les pressions environnementales tout en favorisant le bien-être des occupants et l’accessibilité financière à long terme.</p>`,
    sourcesTitle: 'Sources et lectures complémentaires',
    sourceLabels: [
      ['energy', 'Centre canadien d’information sur l’énergie (2026). Cahier d’information sur l’énergie, printemps 2026 : efficacité énergétique.', 'Données canadiennes utilisées pour la figure 1.'],
      ['envelope', 'Ressources naturelles Canada. Emprisonnons la chaleur : le fonctionnement de votre maison.', 'Transferts de chaleur, enveloppe et ventilation.'],
      ['health', 'Organisation mondiale de la Santé (2018). Lignes directrices relatives au logement et à la santé.', 'Recommandations fondées sur les données probantes.'],
      ['trial', 'Howden-Chapman et ses collègues (2007). Effets de l’isolation des logements existants sur les inégalités de santé. BMJ, 334, 460.', 'Étude communautaire randomisée ; résultats ajustés pour la figure 2.'],
      ['materials', 'Olsson, Miller et Alexander (2023). Voies de décarbonation à court terme de la production mondiale de béton. Nature Communications, 14, 4574.', 'Efficacité matérielle, conception et modélisation de la durée de service.'],
      ['climate', 'GIEC (2022). Changement climatique 2022 : atténuation du changement climatique, chapitre 9 : bâtiments.', 'Choix à long terme, bien-être et atténuation.']
    ],
    methods: 'À propos : synthèse pédagogique des sources ci-dessus, et non nouvelle expérience ou évaluation d’un logement particulier. Graphiques réalisés à partir des données publiées. Les exemples illustrent le raisonnement ; les résultats dépendent du logement et du contexte local. Les liens donnent accès aux publications originales, dont certaines sont en anglais.',
    back: 'Retour à l’accueil'
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
