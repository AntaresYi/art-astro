// Sample data - in production this would come from an API
console.log("Script loaded!"); // 确认脚本已加载

document.getElementById('ask-button').addEventListener('click', function() {
  console.log("Button clicked!"); // 确认点击事件触发
  askAI();
});
const astronomyItems = [
    {
        id: 1,
        title: "Creativity and Curiosity: A Collaboration between Artists and Astronomers",
        category: "collaboration",
        description: "Creativity and Curiosity is an art-science project co-founded and led by UK-based contemporary artists Ione Parkin and Gillian McFarland.",
        year: "since 2017",
        contributors: ["An Lanntair", "Gillian McFarland", "Ione Parkin", "Graeme Hawes", "Kate Bernstein"],
        link: "https://www.creativityandcuriosity.com/",
        keywords: ["art-science", "collaboration", "Britain"],
        image: "images/creativity.jpg"
    },
    {
        id: 2,
        title: "Astrophotography and the art of collaboration",
        category: "publication",
        description: "One young photographer's journey shows how teamwork is expanding the bounds of astroimaging.",
        year: 2024,
        contributors: ["Astronomy(magazine)", "William Ostling"],
        link: "https://www.astronomy.com/observing/astrophotography-and-the-art-of-collaboration/",
        keywords: ["astrophotography", "collaboration", "USA"],
        image: "images/astrophotography.jpg"
    },
    {
        id: 3,
        title: "Dark Distortions",
        category: "exhibition",
        description: "A glittering visualization of dark matter, inspired by Euclid, a forthcoming ESA mission to study the mysterious nature of dark matter.",
        year: 2020,
        contributors: ["ESA/Leiden University", "Thijs Biersteker", "Henk Hoekstra"],
        link: "https://www.ecsite.eu/activities-and-services/events/how-can-artists-and-astronomers-collaborate-communicate-mysteries",
        keywords: ["dark matter", "Euclid mission", "Netherlands"],
        image: "images/Darkdistortions.jpg"
    },
    {
        id: 4,
        title: "The Astronomical Imagination",
        category: "collaboration",
        description: "Examines what happens when we bring artistic methods into relation with the scientific method.",
        year: "since 2021",
        contributors: ["Laboratory for Artistic Intelligence", "Helen Yung", "Samita Sinha", "Miguel Flores Jr.", "Gurtina Besla"],
        link: "https://artisticintelligence.com/artistic-research/astronomical-imagination/",
        keywords: ["artistic research", "scientific method", "Canada"],
        image: "images/astronomicalimagination.jpg"
    },
    {
        id: 5,
        title: "Art of Artemis",
        category: "collaboration",
        description: "To celebrate the first Artemis mission and highlight the Moon's importance in human history, ESA teamed up with art and digital design schools to showcase new artists and their vision of lunar exploration.",
        year: 2022,
        contributors: ["ESA"],
        link: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Orion/Art_for_Artemis",
        keywords: ["Artemis", "Moon", "Europe"],
        image: "images/Artforartemis.jpg"
    },
    {
        id: 6,
        title: "NASA's Partnership Between Art and Science: A Collaboration to Cherish",
        category: "collaboration",
        description: "NASA has partnered with the Maryland Institute College of Art (MICA) to bring complex astrophysics concepts to life for the public through animation.",
        year: 2020,
        contributors: ["NASA", "Maryland Institute College of Art", "Laurence Arcadias", "Robin Corbet"],
        link: "https://www.nasa.gov/centers-and-facilities/goddard/nasas-partnership-between-art-and-science-a-collaboration-to-cherish/",
        keywords: ["NASA", "animation", "art-science", "USA"],
        image: "images/nasacherish.jpg"
    },
    {
        id: 7,
        title: "The Bruce Murray Space Image Library",
        category: "collaboration",
        description: "A unique collection of recent and past photos and videos from the world's space agencies, artwork, diagrams, and amateur-processed space images.",
        year: "",
        contributors: ["The Planetary Society"],
        link: "https://www.planetary.org/space-images",
        keywords: ["space images", "archive", "USA"],
        image: "images/glue-ghost-lunar-sunrise.jpg"
    },
    {
        id: 8,
        title: "PlanetScape: Fusing art, science and technology",
        category: "collaboration",
        description: "A multimedia project that combines art, science and interactive technology to explore possible planets for human survival in the future.",
        year: 2024,
        contributors: ["University of Arizona Health Science", "Yuanyuan Kay He", "Peter Torpey", "Gustavo de Oliveira Almeida"],
        link: "https://healthsciences.arizona.edu/news/stories/planetscape-fusing-art-science-and-technology",
        keywords: ["exoplanets", "multimedia", "interactive", "USA"],
        image: "images/planetscape.jpg"
    },
    {
        id: 9,
        title: "SPACE Lab [co-creative art astronomy experiments]",
        category: "collaboration",
        description: "Presents an expanded field of experiments as artworks co-developed by artists with astrophysicists.",
        year: 2023,
        contributors: ["Art in Perprtuity Trust", "Nicola Rae", "Ulrike Kuchner"],
        link: "https://www.aptstudios.org/exhibitions2223-spacelab",
        keywords: ["art-astronomy", "experiments", "UK"],
        image: "images/space+lab+2.jpg"
    },
    {
        id: 10,
        title: "Small Void",
        category: "artwork",
        description: "A cooperative two-player 'call and response' game exploring the limits of language, attachment theory and cosmic annihilation.",
        year: 2025,
        contributors: ["CERN", "Alice Bucknell"],
        link: "https://arts.cern/commission/small-void/",
        keywords: ["game", "cosmic", "CERN", "USA"],
        image: "images/small-void.jpg"
    },
    {
        id: 11,
        title: "Chroma VII",
        category: "artwork",
        description: "A large knotted form inspired by the connections between space, energy, and matter. It consists of 324 cells made of transparent polymers that change color and pattern with kinetic movement.",
        year: 2023,
        contributors: ["CERN", "Yunchul Kim"],
        link: "https://arts.cern/commission/chroma-5/",
        keywords: ["kinetic art", "CERN", "South Korea"],
        image: "images/chroma-vii.jpg"
    },
    {
        id: 12,
        title: "Pacific Standard Universe",
        category: "artwork",
        description: "An original short film about how people used art to explain the cosmos for thousands of years until the modern universe was discovered in southern California.",
        year: 2025,
        contributors: ["Griffith Observatory", "PST ART"],
        link: "https://griffithobservatory.org/shows/pacific-standard-universe/",
        keywords: ["short film", "cosmos", "USA"],
        image: "images/pacific-standard.jpg"
    },
    {
        id: 13,
        title: "Celestial Pottery",
        category: "artwork",
        description: "Ceramic painter who uses glaze to illustrate dramatic celestial scenes on pottery.",
        year: "since 2020",
        contributors: ["Amy Rae Hill"],
        link: "https://amyraehill.com/portfolio",
        keywords: ["ceramics", "pottery", "USA"],
        image: "images/celestial-pottery.jpg"
    },
    {
        id: 14,
        title: "Jupiter Painting",
        category: "artwork",
        description: "Astronomy artist who combines passion for art and astrophysics to create celestial paintings.",
        year: 2021,
        contributors: ["Ash Wheeler"],
        link: "https://www.dustandashco.com/portfolio-1/ngds22ya5f5wbfgt5irpu9dw6li6n0",
        keywords: ["painting", "astronomy art", "Georgia"],
        image: "images/jupiter-painting.jpg"
    },
    {
        id: 15,
        title: "The Wandering Earth 2",
        category: "artwork",
        description: "Chinese science fiction film about Earth being destroyed by the Sun and humans attempting to push Earth out of the solar system.",
        year: 2023,
        contributors: ["China Film Group Corporation", "Frant Gwo"],
        link: "https://en.wikipedia.org/wiki/The_Wandering_Earth_2",
        keywords: ["sci-fi", "Chinese cinema", "China"],
        image: "images/wandering-earth.jpeg"
    },
    {
        id: 16,
        title: "Wood Slice Galaxy Painting",
        category: "artwork",
        description: "Hand-painted wood chip artwork featuring celestial themes such as galaxies and nebulae.",
        year: 2020,
        contributors: ["Chrissy Sparks"],
        link: "https://www.facebook.com/ChrissySparksArt",
        keywords: ["wood art", "galaxies", "Colorado"],
        image: "images/wood-slice-galaxy.jpg"
    },
    {
        id: 17,
        title: "Art for Artemis Slideshow",
        category: "artwork",
        description: "Design and multimedia students from Europe submitted artwork for the transatlantic voyage of the European Service Module-3 for lunar landing.",
        year: 2022,
        contributors: ["ESA"],
        link: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Orion/Art_for_Artemis_slideshow",
        keywords: ["Artemis", "student art", "Europe"],
        image: "images/artemis-slideshow.jpg"
    },
    {
        id: 18,
        title: "The Gift",
        category: "artwork",
        description: "Immersive installation blending astrophysics and emotional reflection, inspired by the research of Dr. Natalie Gosnell.",
        year: 2023,
        contributors: ["Fine Arts Center/Seagraves Galleries", "Amy Myers", "Katie Hodge", "Tina-Hanaé Miller", "Solomon Hoffman", "Natalie Gosnell", "Janani Balasubramanian", "Andrew Kircher"],
        link: "https://fac.coloradocollege.edu/exhibits/the-gift/",
        keywords: ["immersive", "astrophysics", "Colorado"],
        image: "images/the-gift.jpg"
    },
    {
        id: 19,
        title: "NASA Artists Are Creating Eye-Popping Posters for the Eclipse",
        category: "artwork",
        description: "Original scientific yet jaw-dropping posters to educate, engage, and promote astronomy tourism for the eclipse.",
        year: 2024,
        contributors: ["NASA", "Tyler Nordgren"],
        link: "https://www.atlasobscura.com/articles/nasa-eclipse-art",
        keywords: ["eclipse", "posters", "USA"],
        image: "images/nasa-eclipse-posters.jpg"
    },
    {
        id: 20,
        title: "Mai Wada and Anastasia Kokori's Artworks",
        category: "artwork",
        description: "Collaboration aiming to create a new vision of the universe by merging artistic and scientific perspectives.",
        year: "since 2017",
        contributors: ["Mai Wada", "Anastasia Kokori"],
        link: "https://www.maiwada.com/",
        keywords: ["artist-astronomer", "collaboration", "Japan/Greek"],
        image: "images/wada-kokori.jpg"
    },
    {
        id: 21,
        title: "M87* One Year Later: Catching the Black Hole's Turbulent Accretion Flow",
        category: "astronomyproject",
        description: "Event Horizon Telescope collaboration used observations to deepen our understanding of the supermassive black hole at the center of Messier 87.",
        year: "since 2024",
        contributors: ["Event Horizon Telescope Collaboration", "Harvard faculty of Arts and Science"],
        link: "https://eventhorizontelescope.org/m87-one-year-later-catching-black-holes-turbulent-accretion-flow",
        keywords: ["black hole", "EHT", "USA"],
        image: "images/m87-blackhole.png"
    },
    {
        id: 22,
        title: "Explore Earth and Space With Art - Now Including Mars!",
        category: "astronomyproject",
        description: "Creative, hands-on activities that integrate art and science education, now including Mars-focused projects.",
        year: 2024,
        contributors: ["NASA Jet Propulsion Laboratory"],
        link: "https://www.jpl.nasa.gov/edu/resources/project/explore-earth-and-space-with-art-now-including-mars/",
        keywords: ["education", "Mars", "USA"],
        image: "images/earth-space-art.jpg"
    },
    {
        id: 23,
        title: "Gaia Art Project",
        category: "astornomyproject",
        description: "Global space astrometry mission building the largest, most precise three-dimensional map of our Galaxy.",
        year: "since 2000",
        contributors: ["ESA"],
        link: "https://www.esa.int/Science_Exploration/Space_Science/Gaia/Gaia_overview",
        keywords: ["Gaia", "star map", "Europe"],
        image: "images/gaia-project.jpg"
    },
    {
        id: 24,
        title: "Solar Dynamics Observatory",
        category: "mission",
        description: "Designed to help us understand the Sun's influence on Earth and Near-Earth space by studying the solar atmosphere.",
        year: "since 2010",
        contributors: ["NASA"],
        link: "https://sdo.gsfc.nasa.gov/",
        keywords: ["Sun", "solar", "USA"],
        image: "images/solar-dynamics.jpg"
    },
    {
        id: 25,
        title: "Hebridean Dark Skies Festival",
        category: "event",
        description: "Annual programme of arts and astronomy events including live music, film, visual arts, theatre, astronomy talks and stargazing.",
        year: "since 2019",
        contributors: ["An Lanntair"],
        link: "https://lanntair.com/creative-programme/darkskies/",
        keywords: ["dark skies", "festival", "global"],
        image: "images/hebridean-dark.jpeg"
    },
    {
        id: 26,
        title: "Plants and Planets Leiden",
        category: "exhibition",
        description: "Takes visitors on a journey through time and space to explore the origins of life through science, art and nature.",
        year: "2025-2029",
        contributors: ["Leiden University", "Hortus Leiden"],
        link: "https://hortusleiden.nl/zien-en-doen/agenda/activiteiten/planten-planeten#",
        keywords: ["origins of life", "biology", "Netherlands"],
        image: "images/plants-planets.jpg"
    },
    {
        id: 27,
        title: "The Immersive Power of Light Exhibition",
        category: "exhibition",
        description: "Provides a platform for dialogue between artistic expression and scientific inquiry about the nature of light.",
        year: 2024,
        contributors: ["Macquarie University Faculty of Science and Engineering", "Rhonda Davis", "Leonard Janiszewski", "Andrew Simpson"],
        link: "https://www.mq.edu.au/faculty-of-science-and-engineering/news/news/astronomy-and-art-collide",
        keywords: ["light", "perception", "Australia"],
        image: "images/immersive-light.jpeg"
    },
    {
        id: 28,
        title: "Mapping the Heavens Exhibition",
        category: "exhibition",
        description: "Explores the developing art and science of astronomy in Islamic countries and Europe through historical artifacts.",
        year: 2024,
        contributors: ["Nelson Atkins museum of art"],
        link: "https://nelson-atkins.org/new-multi-cultural-multi-faith-advancement-of-astronomy-exhibition/",
        keywords: ["historical", "multicultural", "USA"],
        image: "images/mapping-heavens.jpg"
    },
    {
        id: 29,
        title: "Cosmos Archaeology: Exploring the universe through Art & Science",
        category: "exhibition",
        description: "Blends art and science to reveal the depths of the universe through physics, perception, and sensory interaction.",
        year: 2024,
        contributors: ["Swissnex", "EPFL Pavilions", "Shanghai Astronomy Museum", "Sarah Kenderdine", "Iris Long", "Jean-Paul Kneib"],
        link: "https://swissnex.org/china/event/cosmos-archaeology-%E5%AE%87%E5%AE%99%E8%80%83%E5%8F%A4/",
        keywords: ["immersive", "archaeology", "Switzerland/China"],
        image: "images/cosmos-archaeology.jpg"
    },
    {
        id: 30,
        title: "Arts at CERN Exhibition: Exploring the Unknown",
        category: "exhibition",
        description: "Brings together art and science communities to delve into the unsolved mysteries of the Universe.",
        year: "2023-2026",
        contributors: ["CERN", "Benjamin Maus", "Chloé Delarue", "Julius von Bismarck", "Ryoji Ikeda", "Yunchul Kim"],
        link: "https://arts.cern/exhibition/exploring-the-unknown/",
        keywords: ["CERN", "quantum", "Switzerland"],
        image: "images/cern-arts.jpg"
    },
    {
        id: 31,
        title: "Blended Worlds: Experiments In Interplanetary Imagination",
        category: "exhibition",
        description: "Explores the relationship between humans and our expanding environment through art-science collaborations.",
        year: "2024-2025",
        contributors: ["PST ART", "Ekene Ejioma", "David Bowen", "Darel Carey", "Annette Lee", "Ada Limón", "Bruce Mau", "Viktoria Modesta", "Shane Myrbeck", "Moon Ribas", "Raffi Joe Wartanian", "Saskia Wilson-Brown"],
        link: "https://pst.art/exhibitions/blended-worlds",
        keywords: ["interplanetary", "empathy", "USA"],
        image: "images/blended-worlds.png"
    },
    {
        id: 32,
        title: "Lumen: The Art and Science of Light",
        category: "exhibition",
        description: "Explores how medieval thinkers explained the universe, nature, planetary motion and world philosophy through the study of light.",
        year: 2024,
        contributors: ["PST ART", "Charles Ross", "Helen Pashgian"],
        link: "https://pst.art/en/exhibitions/lumen-the-art-science-of-light",
        keywords: ["medieval", "light", "USA"],
        image: "images/lumen.png"
    },
    {
        id: 33,
        title: "Mapping the Infinite: Cosmologies Across Cultures",
        category: "exhibition",
        description: "Presents rare and visually stunning artworks from across cultures and time periods to explore humanity's diverse interpretations of the universe.",
        year: "2024-2025",
        contributors: ["PST ART", "Josiah McElheny", "Carnegie Observatories", "Griffith Observatory"],
        link: "https://pst.art/en/exhibitions/mapping-the-infinite",
        keywords: ["cosmologies", "cross-cultural", "USA"],
        image: "images/mapping-infinite.png"
    }

];

// 配置Ollama API端点（通过本地代理）
const OLLAMA_API_URL = "http://localhost:3001/api/ask";

// 修改ask-button事件监听器
document.getElementById('ask-button').addEventListener('click', askAI);

// 添加搜索框回车键支持
document.getElementById('ai-search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        askAI();
    }
});
// 上传功能初始化
function initUpload() {
    // 打开模态框
    document.getElementById('upload-btn').addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('upload-modal')).show();
    });

    // 表单提交处理
    document.getElementById('project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // 显示加载状态
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>Uploading...`;
            
            // 构造FormData
            const formData = new FormData(form);
            formData.append('keywords', formData.get('keywords').split(',').map(k => k.trim()));
            formData.append('contributors', formData.get('contributors').split(',').map(c => c.trim()));
            
            // 发送到后端
            const response = await fetch('/api/projects', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error(await response.text());
            
            // 成功处理
            const newProject = await response.json();
            astronomyItems.unshift(newProject); // 添加到数组开头
            renderItems(astronomyItems); // 重新渲染
            
            // 重置表单
            form.reset();
            bootstrap.Modal.getInstance(document.getElementById('upload-modal')).hide();
            
            alert('Project submitted successfully!');
        } catch (err) {
            console.error('Upload failed:', err);
            alert(`Upload failed: ${err.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}
// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    renderItems(astronomyItems);
    setupEventListeners();
});

// Render items to the page
function renderItems(items) {
    const container = document.getElementById('items-container');
    container.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'col-md-6 col-lg-4 mb-4';
        card.innerHTML = `
        <div class="card item-card h-100" data-category="${item.category}" data-id="${item.id}">
          <img src="${item.image}" class="card-img-top" alt="${item.title}" 
               style="height: 200px; object-fit: cover;"
               onerror="this.onerror=null;this.src='images/default.jpg'">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${item.year} • ${item.contributors.join(', ')}</h6>
            <p class="card-text">${item.description.substring(0, 100)}...</p>
            <div class="mb-3">
              ${item.keywords.map(keyword => `<span class="badge badge-custom">${keyword}</span>`).join('')}
            </div>
            <button class="btn btn-outline-primary view-detail" 
                    data-item='${JSON.stringify(item).replace(/'/g, "\\'")}'>
              <i class="fas fa-expand me-2"></i>View Detail
            </button>
          </div>
        </div>
      `;
      
        container.appendChild(card);
    });
}

document.addEventListener('click', function(e) {
    const btn = e.target.closest('.view-detail');
    if (!btn) return;

    // 调试：打印原始数据
    console.log("Raw data-item:", btn.dataset.item);

    try {
        // 安全解析（处理截断数据）
        let itemData = btn.dataset.item;
        
        // 修复1：检查是否被截断
        if (!itemData.endsWith('}')) {
            itemData = itemData.substring(0, itemData.lastIndexOf('}') + 1);
        }
        
        // 修复2：处理转义字符
        itemData = itemData
            .replace(/\\"/g, '"')  // 转换 \" 为 "
            .replace(/\\'/g, "'"); // 转换 \' 为 '
        
        const item = JSON.parse(itemData);
        showDetailModal(item);
    } catch (err) {
        console.error("解析失败 - 原始数据:", btn.dataset.item);
        console.error("错误详情:", err);
        alert("加载详情失败，请刷新后重试");
    }
});
  
  // 显示详情弹窗函数
  function showDetailModal(item) {
    document.getElementById('detail-title').textContent = item.title;
    document.getElementById('detail-image').src = item.image;
    document.getElementById('detail-year').textContent = item.year;
    document.getElementById('detail-contributors').textContent = item.contributors.join(', ');
    document.getElementById('detail-description').textContent = item.description;
    document.getElementById('detail-link').href = item.link;
    
    // 渲染关键词
    const keywordsContainer = document.getElementById('detail-keywords');
    keywordsContainer.innerHTML = item.keywords.map(k => 
      `<span class="badge badge-custom me-2 mb-2">${k}</span>`
    ).join('');
    
    // 显示弹窗
    const modal = new bootstrap.Modal(document.getElementById('detail-modal'));
    modal.show();
  }
// Set up event listeners
function setupEventListeners() {
    // Category filtering
    document.querySelectorAll('.category-filter button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelector('.category-filter .active').classList.remove('active');
            this.classList.add('active');
            
            const category = this.dataset.category;
            const container = document.getElementById('items-container');
            container.innerHTML = '';
            
            if (category === 'all') {
                renderItems(astronomyItems);
            } else {
                const filteredItems = astronomyItems.filter(item => item.category === category);
                renderItems(filteredItems);
            }
        });
    });
    
    // Load more button (simulated)
    document.getElementById('load-more').addEventListener('click', function() {
        this.textContent = 'No more items to load';
        this.disabled = true;
    });
    
    // Handle Enter key in search box
    document.getElementById('ai-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            askAI();
        }
    });
}
// 使用DOMContentLoaded + 事件委托（双保险）
document.addEventListener('DOMContentLoaded', function() {
    // 方法1：直接绑定
    const btn = document.getElementById('upload-btn');
    if (btn) {
        btn.addEventListener('click', handleUploadClick);
    }

    // 方法2：事件委托（防止动态内容问题）
    document.body.addEventListener('click', function(e) {
        if (e.target.closest('#upload-btn')) {
            handleUploadClick();
        }
    });
});

function handleUploadClick() {
    console.log('[调试] 上传按钮被点击');
    try {
        const modal = new bootstrap.Modal(
            document.getElementById('upload-modal'), 
            { keyboard: true }
        );
        modal.show();
    } catch (err) {
        console.error('模态框初始化失败:', err);
        // 后备方案：手动显示
        document.getElementById('upload-modal').classList.add('show');
        document.getElementById('upload-modal').style.display = 'block';
    }
}
// AI问答功能
async function askAI() {
    const questionInput = document.getElementById('ai-search');
    const question = questionInput.value.trim();
    const responseElement = document.getElementById('ai-response');
    
    if (!question) {
        alert("Please enter your question");
        return;
    }
    
    // 显示加载状态
    responseElement.style.display = 'block';
    responseElement.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="spinner-border text-primary me-3" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div>Thinking about your question...</div>
        </div>
    `;
    
    try {
        // 构建优化的prompt
        const prompt = buildPrompt(question);
        
        // 调用Ollama API
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama3", // 或其他你下载的模型
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.7,
                    top_p: 0.9
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 显示回答
        responseElement.innerHTML = `
            <div class="mb-2">
                <strong><i class="fas fa-question-circle me-2"></i>Your Question:</strong>
                <p class="ms-4">${question}</p>
            </div>
            <div>
                <strong><i class="fas fa-robot me-2"></i>AI Response:</strong>
                <p class="ms-4">${formatResponse(data.response)}</p>
            </div>
        `;
        
    } catch (error) {
        console.error('Error:', error);
        responseElement.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Sorry, there was an error processing your request: ${error.message}
            </div>
        `;
    }
}

function getProjectExamples(count) {
    if (!astronomyItems?.length) return "";
    return astronomyItems
        .sort((a, b) => b.year - a.year)
        .slice(0, count)
        .map(item => `- "${item.title}" (${item.year})`)
        .join('\n');
}

// 辅助函数 - 获取所有分类
function getUniqueCategories() {
    return [...new Set(astronomyItems.map(item => item.category))];
}
// 构建优化的prompt
function buildPrompt(question) {
    return `[INST]
<<SYS>>
You are an expert on astronomy and art collaborations. Answer the user's question directly based on the provided project database.
Key dataset characteristics:
- Categories: ${getUniqueCategories().join(', ')}
- Example projects:
${getProjectExamples(3)} 
Rules:
1. Respond ONLY with the answer content
2. Never include [INST], <<SYS>>, or any other instruction markers
3. Do not explain how you generated the answer
4. Keep responses under 200 words
5. If uncertain, say "I couldn't find relevant projects matching your query"
6.Infer answers from ALL ${astronomyItems.length} projects (not just examples)
7.Never list projects unless asked
8.

<</SYS>>

Question: ${question}
[/INST]`;
}

// Helper function to get example projects
function getProjectExamples(count) {
    return astronomyItems.slice(0, count).map(item => 
        `- ${item.title} (${item.year}): ${item.description.substring(0, 80)}...`
    ).join('\n');
}

// 格式化响应文本
function formatResponse(text) {
    // 先去除 Llama 3 的对话标记
    text = text.replace(/\[INST\].*?\[\/INST\]/g, '');
    // 简单的Markdown格式转换
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // 加粗
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // 斜体
        .replace(/\n/g, '<br>'); // 换行
}