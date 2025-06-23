# migrate_projects.py

import os
from dotenv import load_dotenv # 导入 python-dotenv
import cloudinary
import cloudinary.uploader
from pymongo import MongoClient
import json
from datetime import datetime # 确保导入 datetime

# --- Load environment variables from .env file ---
# 假设 .env 文件在 migrate_projects.py 脚本的某个父目录中，或者你直接复制了值
# 如果 .env 文件和 migrate_projects.py 在不同的父目录下，需要调整 load_dotenv() 的路径
load_dotenv()

# --- MongoDB Configuration ---
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    # 尝试加载当前目录或上级目录的 .env
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))
    MONGO_URI = os.getenv('MONGO_URI')
    if not MONGO_URI:
        raise ValueError("MONGO_URI not found in .env file. Please check its location or content.")

# --- Cloudinary Configuration ---
CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

if not all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET]):
    raise ValueError("Cloudinary credentials (CLOUD_NAME, API_KEY, API_SECRET) not found in .env file.")

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET
)

# --- Path to your old local image folder ---
# 如果 migrate_projects.py 和 images 文件夹在同一个目录下 (例如都在 frontend/)
IMAGE_FOLDER_PATH = './images'
# 如果 migrate_projects.py 在 backend/ 而 images 在 frontend/
# IMAGE_FOLDER_PATH = '../frontend/images'
# 请根据你实际的项目结构选择或修改 above line.

# --- Your old astronomyItems data from app.js ---
# IMPORTANT: This list is directly copied from your old app.js,
# but the 'image' field values have been manually edited to remove the 'images/' prefix.
old_astronomy_items = [
    {
        "id": 1,
        "title": "Creativity and Curiosity: A Collaboration between Artists and Astronomers",
        "category": "collaboration",
        "description": "Creativity and Curiosity is an art-science project co-founded and led by UK-based contemporary artists Ione Parkin and Gillian McFarland.",
        "year": 2017, # Changed from "since 2017"
        "contributors": ["An Lanntair", "Gillian McFarland", "Ione Parkin", "Graeme Hawes", "Kate Bernstein"],
        "link": "https://www.creativityandcuriosity.com/",
        "keywords": ["art-science", "collaboration", "Britain"],
        "image": "creativity.jpg" # Prefix removed
    },
    {
        "id": 2,
        "title": "Astrophotography and the art of collaboration",
        "category": "publication",
        "description": "One young photographer's journey shows how teamwork is expanding the bounds of astroimaging.",
        "year": 2024,
        "contributors": ["Astronomy(magazine)", "William Ostling"],
        "link": "https://www.astronomy.com/observing/astrophotography-and-the-art-of-collaboration/",
        "keywords": ["astrophotography", "collaboration", "USA"],
        "image": "astrophotography.jpg" # Prefix removed
    },
    {
        "id": 3,
        "title": "Dark Distortions",
        "category": "exhibition",
        "description": "A glittering visualization of dark matter, inspired by Euclid, a forthcoming ESA mission to study the mysterious nature of dark matter.",
        "year": 2020,
        "contributors": ["ESA/Leiden University", "Thijs Biersteker", "Henk Hoekstra"],
        "link": "https://www.ecsite.eu/activities-and-services/events/how-can-artists-and-astronomers-collaborate-communicate-mysteries",
        "keywords": ["dark matter", "Euclid mission", "Netherlands"],
        "image": "Darkdistortions.jpg" # Prefix removed
    },
    {
        "id": 4,
        "title": "The Astronomical Imagination",
        "category": "collaboration",
        "description": "Examines what happens when we bring artistic methods into relation with the scientific method.",
        "year": 2021, # Changed from "since 2021"
        "contributors": ["Laboratory for Artistic Intelligence", "Helen Yung", "Samita Sinha", "Miguel Flores Jr.", "Gurtina Besla"],
        "link": "https://artisticintelligence.com/artistic-research/astronomical-imagination/",
        "keywords": ["artistic research", "scientific method", "Canada"],
        "image": "astronomicalimagination.jpg" # Prefix removed
    },
    {
        "id": 5,
        "title": "Art of Artemis",
        "category": "collaboration",
        "description": "To celebrate the first Artemis mission and highlight the Moon's importance in human history, ESA teamed up with art and digital design schools to showcase new artists and their vision of lunar exploration.",
        "year": 2022,
        "contributors": ["ESA"],
        "link": "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Orion/Art_for_Artemis",
        "keywords": ["Artemis", "Moon", "Europe"],
        "image": "Artforartemis.jpg" # Prefix removed
    },
    {
        "id": 6,
        "title": "NASA's Partnership Between Art and Science: A Collaboration to Cherish",
        "category": "collaboration",
        "description": "NASA has partnered with the Maryland Institute College of Art (MICA) to bring complex astrophysics concepts to life for the public through animation.",
        "year": 2020,
        "contributors": ["NASA", "Maryland Institute College of Art", "Laurence Arcadias", "Robin Corbet"],
        "link": "https://www.nasa.gov/centers-and-facilities/goddard/nasas-partnership-between-art-and-science-a-collaboration-to-cherish/",
        "keywords": ["NASA", "animation", "art-science", "USA"],
        "image": "nasacherish.jpg" # Prefix removed
    },
    {
        "id": 7,
        "title": "The Bruce Murray Space Image Library",
        "category": "collaboration",
        "description": "A unique collection of recent and past photos and videos from the world's space agencies, artwork, diagrams, and amateur-processed space images.",
        "year": 0, # Changed from ""
        "contributors": ["The Planetary Society"],
        "link": "https://www.planetary.org/space-images",
        "keywords": ["space images", "archive", "USA"],
        "image": "glue-ghost-lunar-sunrise.jpg" # Prefix removed
    },
    {
        "id": 8,
        "title": "PlanetScape: Fusing art, science and technology",
        "category": "collaboration",
        "description": "A multimedia project that combines art, science and interactive technology to explore possible planets for human survival in the future.",
        "year": 2024,
        "contributors": ["University of Arizona Health Science", "Yuanyuan Kay He", "Peter Torpey", "Gustavo de Oliveira Almeida"],
        "link": "https://healthsciences.arizona.edu/news/stories/planetscape-fusing-art-science-and-technology",
        "keywords": ["exoplanets", "multimedia", "interactive", "USA"],
        "image": "planetscape.jpg" # Prefix removed
    },
    {
        "id": 9,
        "title": "SPACE Lab [co-creative art astronomy experiments]",
        "category": "collaboration",
        "description": "Presents an expanded field of experiments as artworks co-developed by artists with astrophysicists.",
        "year": 2023,
        "contributors": ["Art in Perprtuity Trust", "Nicola Rae", "Ulrike Kuchner"],
        "link": "https://www.aptstudios.org/exhibitions2223-spacelab",
        "keywords": ["art-astronomy", "experiments", "UK"],
        "image": "space+lab+2.jpg" # Prefix removed
    },
    {
        "id": 10,
        "title": "Small Void",
        "category": "artwork",
        "description": "A cooperative two-player 'call and response' game exploring the limits of language, attachment theory and cosmic annihilation.",
        "year": 2025,
        "contributors": ["CERN", "Alice Bucknell"],
        "link": "https://arts.cern/commission/small-void/",
        "keywords": ["game", "cosmic", "CERN", "USA"],
        "image": "small-void.jpg" # Prefix removed
    },
    {
        "id": 11,
        "title": "Chroma VII",
        "category": "artwork",
        "description": "A large knotted form inspired by the connections between space, energy, and matter. It consists of 324 cells made of transparent polymers that change color and pattern with kinetic movement.",
        "year": 2023,
        "contributors": ["CERN", "Yunchul Kim"],
        "link": "https://arts.cern/commission/chroma-5/",
        "keywords": ["kinetic art", "CERN", "South Korea"],
        "image": "chroma-vii.jpg" # Prefix removed
    },
    {
        "id": 12,
        "title": "Pacific Standard Universe",
        "category": "artwork",
        "description": "An original short film about how people used art to explain the cosmos for thousands of years until the modern universe was discovered in southern California.",
        "year": 2025,
        "contributors": ["Griffith Observatory", "PST ART"],
        "link": "https://griffithobservatory.org/shows/pacific-standard-universe/",
        "keywords": ["short film", "cosmos", "USA"],
        "image": "pacific-standard.jpg" # Prefix removed
    },
    {
        "id": 13,
        "title": "Celestial Pottery",
        "category": "artwork",
        "description": "Ceramic painter who uses glaze to illustrate dramatic celestial scenes on pottery.",
        "year": 2020, # Changed from "since 2020"
        "contributors": ["Amy Rae Hill"],
        "link": "https://amyraehill.com/portfolio",
        "keywords": ["ceramics", "pottery", "USA"],
        "image": "celestial-pottery.jpg" # Prefix removed
    },
    {
        "id": 14,
        "title": "Jupiter Painting",
        "category": "artwork",
        "description": "Astronomy artist who combines passion for art and astrophysics to create celestial paintings.",
        "year": 2021,
        "contributors": ["Ash Wheeler"],
        "link": "https://www.dustandashco.com/portfolio-1/ngds22ya5f5wbfgt5irpu9dw6li6n0",
        "keywords": ["painting", "astronomy art", "Georgia"],
        "image": "jupiter-painting.jpg" # Prefix removed
    },
    {
        "id": 15,
        "title": "The Wandering Earth 2",
        "category": "artwork",
        "description": "Chinese science fiction film about Earth being destroyed by the Sun and humans attempting to push Earth out of the solar system.",
        "year": 2023,
        "contributors": ["China Film Group Corporation", "Frant Gwo"],
        "link": "https://en.wikipedia.org/wiki/The_Wandering_Earth_2",
        "keywords": ["sci-fi", "Chinese cinema", "China"],
        "image": "wandering-earth.jpeg" # Prefix removed
    },
    {
        "id": 16,
        "title": "Wood Slice Galaxy Painting",
        "category": "artwork",
        "description": "Hand-painted wood chip artwork featuring celestial themes such as galaxies and nebulae.",
        "year": 2020,
        "contributors": ["Chrissy Sparks"],
        "link": "https://www.facebook.com/ChrissySparksArt",
        "keywords": ["wood art", "galaxies", "Colorado"],
        "image": "wood-slice-galaxy.jpg" # Prefix removed
    },
    {
        "id": 17,
        "title": "Art for Artemis Slideshow",
        "category": "artwork",
        "description": "Design and multimedia students from Europe submitted artwork for the transatlantic voyage of the European Service Module-3 for lunar landing.",
        "year": 2022,
        "contributors": ["ESA"],
        "link": "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Orion/Art_for_Artemis_slideshow",
        "keywords": ["Artemis", "student art", "Europe"],
        "image": "artemis-slideshow.jpg" # Prefix removed
    },
    {
        "id": 18,
        "title": "The Gift",
        "category": "artwork",
        "description": "Immersive installation blending astrophysics and emotional reflection, inspired by the research of Dr. Natalie Gosnell.",
        "year": 2023,
        "contributors": ["Fine Arts Center/Seagraves Galleries", "Amy Myers", "Katie Hodge", "Tina-Hanaé Miller", "Solomon Hoffman", "Natalie Gosnell", "Janani Balasubramanian", "Andrew Kircher"],
        "link": "https://fac.coloradocollege.edu/exhibits/the-gift/",
        "keywords": ["immersive", "astrophysics", "Colorado"],
        "image": "the-gift.jpg" # Prefix removed
    },
    {
        "id": 19,
        "title": "NASA Artists Are Creating Eye-Popping Posters for the Eclipse",
        "category": "artwork",
        "description": "Original scientific yet jaw-dropping posters to educate, engage, and promote astronomy tourism for the eclipse.",
        "year": 2024,
        "contributors": ["NASA", "Tyler Nordgren"],
        "link": "https://www.atlasobscura.com/articles/nasa-eclipse-art",
        "keywords": ["eclipse", "posters", "USA"],
        "image": "nasa-eclipse-posters.jpg" # Prefix removed
    },
    {
        "id": 20,
        "title": "Mai Wada and Anastasia Kokori's Artworks",
        "category": "artwork",
        "description": "Collaboration aiming to create a new vision of the universe by merging artistic and scientific perspectives.",
        "year": 2017, # Changed from "since 2017"
        "contributors": ["Mai Wada", "Anastasia Kokori"],
        "link": "https://www.maiwada.com/",
        "keywords": ["artist-astronomer", "collaboration", "Japan/Greek"],
        "image": "wada-kokori.jpg" # Prefix removed
    },
    {
        "id": 21,
        "title": "M87* One Year Later: Catching the Black Hole's Turbulent Accretion Flow",
        "category": "astronomyproject",
        "description": "Event Horizon Telescope collaboration used observations to deepen our understanding of the supermassive black hole at the center of Messier 87.",
        "year": 2024, # Changed from "since 2024"
        "contributors": ["Event Horizon Telescope Collaboration", "Harvard faculty of Arts and Science"],
        "link": "https://eventhorizontelescope.org/m87-one-year-later-catching-black-holes-turbulent-accretion-flow",
        "keywords": ["black hole", "EHT", "USA"],
        "image": "m87-blackhole.png" # Prefix removed
    },
    {
        "id": 22,
        "title": "Explore Earth and Space With Art - Now Including Mars!",
        "category": "astronomyproject",
        "description": "Creative, hands-on activities that integrate art and science education, now including Mars-focused projects.",
        "year": 2024,
        "contributors": ["NASA Jet Propulsion Laboratory"],
        "link": "https://www.jpl.nasa.gov/edu/resources/project/explore-earth-and-space-with-art-now-including-mars/",
        "keywords": ["education", "Mars", "USA"],
        "image": "earth-space-art.jpg" # Prefix removed
    },
    {
        "id": 23,
        "title": "Gaia Art Project",
        "category": "astornomyproject",
        "description": "Global space astrometry mission building the largest, most precise three-dimensional map of our Galaxy.",
        "year": 2000, # Changed from "since 2000"
        "contributors": ["ESA"],
        "link": "https://www.esa.int/Science_Exploration/Space_Science/Gaia/Gaia_overview",
        "keywords": ["Gaia", "star map", "Europe"],
        "image": "gaia-project.jpg" # Prefix removed
    },
    {
        "id": 24,
        "title": "Solar Dynamics Observatory",
        "category": "mission",
        "description": "Designed to help us understand the Sun's influence on Earth and Near-Earth space by studying the solar atmosphere.",
        "year": 2010, # Changed from "since 2010"
        "contributors": ["NASA"],
        "link": "https://sdo.gsfc.nasa.gov/",
        "keywords": ["Sun", "solar", "USA"],
        "image": "solar-dynamics.jpg" # Prefix removed
    },
    {
        "id": 25,
        "title": "Hebridean Dark Skies Festival",
        "category": "event",
        "description": "Annual programme of arts and astronomy events including live music, film, visual arts, theatre, astronomy talks and stargazing.",
        "year": 2019, # Changed from "since 2019"
        "contributors": ["An Lanntair"],
        "link": "https://lanntair.com/creative-programme/darkskies/",
        "keywords": ["dark skies", "festival", "global"],
        "image": "hebridean-dark.jpeg" # Prefix removed
    },
    {
        "id": 26,
        "title": "Plants and Planets Leiden",
        "category": "exhibition",
        "description": "Takes visitors on a journey through time and space to explore the origins of life through science, art and nature.",
        "year": 2025, # Changed from "2025-2029"
        "contributors": ["Leiden University", "Hortus Leiden"],
        "link": "https://hortusleiden.nl/zien-en-doen/agenda/activiteiten/planten-planeten#",
        "keywords": ["origins of life", "biology", "Netherlands"],
        "image": "plants-planets.jpg" # Prefix removed
    },
    {
        "id": 27,
        "title": "The Immersive Power of Light Exhibition",
        "category": "exhibition",
        "description": "Provides a platform for dialogue between artistic expression and scientific inquiry about the nature of light.",
        "year": 2024,
        "contributors": ["Macquarie University Faculty of Science and Engineering", "Rhonda Davis", "Leonard Janiszewski", "Andrew Simpson"],
        "link": "https://www.mq.edu.au/faculty-of-science-and-engineering/news/news/astronomy-and-art-collide",
        "keywords": ["light", "perception", "Australia"],
        "image": "immersive-light.jpeg" # Prefix removed
    },
    {
        "id": 28,
        "title": "Mapping the Heavens Exhibition",
        "category": "exhibition",
        "description": "Explores the developing art and science of astronomy in Islamic countries and Europe through historical artifacts.",
        "year": 2024,
        "contributors": ["Nelson Atkins museum of art"],
        "link": "https://nelson-atkins.org/new-multi-cultural-multi-faith-advancement-of-astronomy-exhibition/",
        "keywords": ["historical", "multicultural", "USA"],
        "image": "mapping-heavens.jpg" # Prefix removed
    },
    {
        "id": 29,
        "title": "Cosmos Archaeology: Exploring the universe through Art & Science",
        "category": "exhibition",
        "description": "Blends art and science to reveal the depths of the universe through physics, perception, and sensory interaction.",
        "year": 2024,
        "contributors": ["Swissnex", "EPFL Pavilions", "Shanghai Astronomy Museum", "Sarah Kenderdine", "Iris Long", "Jean-Paul Kneib"],
        "link": "https://swissnex.org/china/event/cosmos-archaeology-%E5%AE%87%E5%AE%99%E8%80%83%E5%8F%A4/",
        "keywords": ["immersive", "archaeology", "Switzerland/China"],
        "image": "cosmos-archaeology.jpg" # Prefix removed
    },
    {
        "id": 30,
        "title": "Arts at CERN Exhibition: Exploring the Unknown",
        "category": "exhibition",
        "description": "Brings together art and science communities to delve into the unsolved mysteries of the Universe.",
        "year": 2023, # Changed from "2023-2026"
        "contributors": ["CERN", "Benjamin Maus", "Chloé Delarue", "Julius von Bismarck", "Ryoji Ikeda", "Yunchul Kim"],
        "link": "https://arts.cern/exhibition/exploring-the-unknown/",
        "keywords": ["CERN", "quantum", "Switzerland"],
        "image": "cern-arts.jpg" # Prefix removed
    },
    {
        "id": 31,
        "title": "Blended Worlds: Experiments In Interplanetary Imagination",
        "category": "exhibition",
        "description": "Explores the relationship between humans and our expanding environment through art-science collaborations.",
        "year": 2024, # Changed from "2024-2025"
        "contributors": ["PST ART", "Ekene Ejioma", "David Bowen", "Darel Carey", "Annette Lee", "Ada Limón", "Bruce Mau", "Viktoria Modesta", "Moon Ribas", "Raffi Joe Wartanian", "Saskia Wilson-Brown"],
        "link": "https://pst.art/exhibitions/blended-worlds",
        "keywords": ["interplanetary", "empathy", "USA"],
        "image": "blended-worlds.png" # Prefix removed
    },
    {
        "id": 32,
        "title": "Lumen: The Art and Science of Light",
        "category": "exhibition",
        "description": "Explores how medieval thinkers explained the universe, nature, planetary motion and world philosophy through the study of light.",
        "year": 2024,
        "contributors": ["PST ART", "Charles Ross", "Helen Pashgian"],
        "link": "https://pst.art/en/exhibitions/lumen-the-art-science-of-light",
        "keywords": ["medieval", "light", "USA"],
        "image": "lumen.png" # Prefix removed
    },
    {
        "id": 33,
        "title": "Mapping the Infinite: Cosmologies Across Cultures",
        "category": "exhibition",
        "description": "Presents rare and visually stunning artworks from across cultures and time periods to explore humanity's diverse interpretations of the universe.",
        "year": 2024, # Changed from "2024-2025"
        "contributors": ["PST ART", "Josiah McElheny", "Carnegie Observatories", "Griffith Observatory"],
        "link": "https://pst.art/en/exhibitions/mapping-the-infinite",
        "keywords": ["cosmologies", "cross-cultural", "USA"],
        "image": "mapping-infinite.png" # Prefix removed
    }
]


def parse_year(year_str):
    """
    Parses a year string to an integer. Handles ranges and 'since' prefixes.
    If it's already an int, returns it directly.
    """
    if isinstance(year_str, int):
        return year_str
    try:
        # Attempt direct conversion if it's a string that's just a number
        return int(year_str)
    except ValueError:
        pass # Not a simple number string

    # If parsing fails, try to find a 4-digit number within the string
    import re
    match = re.search(r'\b\d{4}\b', str(year_str)) # Ensure it's a string for regex
    if match:
        return int(match.group(0))

    print(f"Warning: Could not parse year '{year_str}'. Using 0 as a fallback.")
    return 0 # Default to 0 or another suitable fallback


def upload_image_to_cloudinary(image_filename, project_title):
    """
    Uploads an image to Cloudinary and returns its secure URL.
    """
    image_path = os.path.join(IMAGE_FOLDER_PATH, image_filename)
    if not os.path.exists(image_path):
        print(f"Warning: Image file not found at {image_path}. Skipping upload for this image.")
        return None

    try:
        # Use a descriptive public ID for better organization in Cloudinary
        # Replace spaces/colons in title for public_id, add a unique suffix
        safe_title = project_title.replace(' ', '_').replace(':', '').replace('/', '_').lower()
        base_filename = os.path.splitext(image_filename)[0]
        public_id_stem = f"{safe_title}_{base_filename}"

        upload_result = cloudinary.uploader.upload(
            image_path,
            folder="astronomy_collaborations", # Consistent folder name in Cloudinary
            public_id=public_id_stem,
            eager=[
                {"width": 400, "height": 300, "crop": "fill", "gravity": "auto"},
            ],
            # overwrite=False # Optional: set to True if you want to re-upload existing
        )
        return upload_result['secure_url']
    except Exception as e:
        print(f"Error uploading {image_filename} for project '{project_title}' to Cloudinary: {e}")
        return None

def migrate_projects():
    client = None
    try:
        client = MongoClient(MONGO_URI)
        db = client.get_default_database() # Connects to the database specified in MONGO_URI
        projects_collection = db['projects'] # Assuming your collection is named 'projects'

        print("Starting project migration...")

        for i, old_item in enumerate(old_astronomy_items):
            print(f"Processing project {i+1}/{len(old_astronomy_items)}: '{old_item['title']}'")

            # Check if a project with the same title already exists to prevent duplicates
            existing_project = projects_collection.find_one({"title": old_item["title"]})
            if existing_project:
                print(f"Skipping '{old_item['title']}', already exists in DB with _id: {existing_project['_id']}.")
                continue

            # 1. Upload image to Cloudinary
            image_filename = old_item.get('image')
            image_url = None
            if image_filename:
                image_url = upload_image_to_cloudinary(image_filename, old_item['title'])
                if not image_url:
                    print(f"Warning: Could not get Cloudinary URL for '{old_item['title']}'. This project might be missing an image.")
            else:
                print(f"No image filename specified for project '{old_item['title']}'.")

            # 2. Prepare new project data for MongoDB
            new_project_data = {
                "title": old_item['title'],
                "year": parse_year(old_item['year']), # Convert year to integer
                "category": old_item['category'],
                "contributors": old_item['contributors'], # Assumed to be list of strings already
                "description": old_item['description'],
                "keywords": old_item.get('keywords', []), # Assumed to be list of strings already
                "link": old_item.get('link', None), # Use None instead of '' if link is empty/missing
                "imageUrl": image_url, # Cloudinary URL
                "uploaderName": "Migration Script", # Default name for migrated items
                "contactEmail": "migration@example.com", # Default email for migrated items
                "isApproved": True, # Directly approve migrated projects
                "submissionDate": datetime.now(), # Use current time for submission
                "approvalDate": datetime.now() # Use current time for approval
            }

            # If link is an empty string, set it to None as per Mongoose schema for optional fields
            if new_project_data['link'] == '':
                new_project_data['link'] = None

            # 3. Insert into MongoDB
            result = projects_collection.insert_one(new_project_data)
            print(f"Successfully inserted '{new_project_data['title']}' with ID: {result.inserted_id}")

        print("\nProject migration completed!")

    except Exception as e:
        print(f"\nAn ERROR occurred during migration: {e}")
        import traceback
        traceback.print_exc() # Print full traceback for debugging
    finally:
        if client:
            client.close()
            print("MongoDB connection closed.")

if __name__ == "__main__":
    migrate_projects()