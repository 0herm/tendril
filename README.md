# Tendril
> **Tendril** (`/ˈtɛn.drɪl/`, *TEN-dril*). The slender shoot a climbing plant sends out to reach, find, and latch onto support, just as the app reaches out to track whats worth holding onto.

A self-hosted media tracker for movies and TV shows. Search, explore recommendations, browse categories, check out upcoming releases, and stay on top of what you're watching.

**Build With**  
NextJS with TypeScript, React and Tailwind. For the database Postgress is used to store watch lists.

### ✨ Features


### ⚙️ Environment Variables

| Name              | Notes                                                                                                                            |
|-------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ACCESS_TOKEN      | API token for The Movie Database                                                                                                 |
| REGION            | Default to `GB`, uses a language code with ISO 3166 1 e.g `NO`                                                                   |
| LANGUAGE          | Default to `en-GB`, uses a language code with ISO 639-1 e.g `en`, for more specific add country code with ISO 3166-1 e.g `en-US` |
| ORIGINAL_TITLE    | Default to `false`, set to `True` to show the original titles for movies and TV shows                                            |
| INCLUDE_ADULT     | Default to `false`, set to `True` to include adult content in movies and TV shows searches                                       |
| TIMEZONE          | Default to `Europe/London`, the timezone for TMDB,uses ISO 3166 1                                                                |
| POSTGRES_HOST     | Default to `postgres`, the host for the postgres database                                                                        |
| POSTGRES_PORT     | Default to `5432`, the port for the postgres database                                                                            |
| POSTGRES_USER     | Default to `admin`, the username for the postgres database                                                                       |
| POSTGRES_PASSWORD | Passowrd for the postgres database user                                                                                          |
| POSTGRES_DB       | Default to `tendril`, the name for the postgres database                                                                         |

### 🐳 Install with Docker
Remember to set the environment variables you wish in the .env file. ( minimum `ACCESS_TOKEN` and `POSTGRES_PASSWORD` )   
To start the containers run:

~~~ 
docker-compose up -d 
~~~ 

Then go to: http://localhost:3002