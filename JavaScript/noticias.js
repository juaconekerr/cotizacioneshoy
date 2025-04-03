// Clave API de NewsData.io
const apiKey = 'pub_78073bd977b35efa2f59f04db1bf777971711';
const url = `https://newsdata.io/api/1/news?apikey=pub_78073bd977b35efa2f59f04db1bf777971711&q=economia&language=es `;

// Elemento contenedor para las noticias
document.addEventListener('DOMContentLoaded', () => {
    const noticiasContainer = document.getElementById('noticias-container');
    const loader = document.getElementById('loader');

    // Función para crear una noticia
    function crearNoticia(noticia) {
        // Crear elementos de la noticia
        const noticiaDiv = document.createElement('div');
        noticiaDiv.className = 'noticia';
        const tituloNoticia = document.createElement('h2');
        tituloNoticia.className = 'titulo-noticia';
        tituloNoticia.textContent = noticia.title;
        const contenidoNoticia = document.createElement('p');
        contenidoNoticia.className = 'contenido-noticia';
        contenidoNoticia.textContent = noticia.description;
        const enlaceNoticia = document.createElement('a');
        enlaceNoticia.href = noticia.link;
        enlaceNoticia.textContent = 'Leer más';
        enlaceNoticia.target = '_blank';
        enlaceNoticia.className = 'enlace-noticia';
        noticiaDiv.appendChild(tituloNoticia);
        noticiaDiv.appendChild(contenidoNoticia);
        noticiaDiv.appendChild(enlaceNoticia);
        return noticiaDiv;
    }

    // Función principal para cargar las noticias
    function cargarNoticias() {
        console.log('Cargando noticias...');
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Noticias obtenidas:', data);
                data.results.forEach(article => {
                    const noticiaDiv = crearNoticia(article);
                    noticiasContainer.appendChild(noticiaDiv);
                });
                // Ocultar el loader y mostrar las noticias
                loader.style.display = 'none';
                noticiasContainer.style.display = 'block';
            })
            .catch(error => {
                console.error('Error al cargar las noticias:', error);
                // Ocultar el loader aunque ocurra un error
                loader.style.display = 'none';
            });
    }

    // Cargar las noticias al cargar la página
    cargarNoticias();
});