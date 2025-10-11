/*
    ----------------------------------------------
    ----------  /udemy.antonydev.tech/  ----------
    ----------  /curso-ia-web-local/  ------------
    ----------  /01-modelo-writer/  --------------
    ----------  /main.js  ------------------------
    ----------------------------------------------
*/


(() => {


    let writer;

    const generateBtn = document.querySelector('#generate');


    generateBtn.addEventListener('click', async () => {


        const idea = document.querySelector('#idea').value.trim();
        const tone = document.querySelector('#tone').value;
        const length = document.querySelector('#length').value;
        const output = document.querySelector('#output');

        //  -----  Mensaje de Espera  -----
        output.textContent = '⏳ Comprobando Disponibilidad...';


        //  -----  Comprobar si mi navegador es compatible con Writer  -----
        if (!(Writer in self))
            output.textContent = '⚠️ Lo siento, tu navegador no es compatible con Writer.';


        //  -----  Comprobar disponibilidad  -----
        const disponible = await Writer.availability();

        if (disponible === "unavailable")
            output.textContent = '⚠️ Lo siento, Writer no está disponible en este momento. Inténtalo de nuevo más tarde.';


        //  -----  Definir las opciones del prompt  -----
        const options = {
            tone,
            length,
            format: "plain-text",
            sharedContext: "contenido generado desde una idea inicial del usuario"
        };


        //  -----  Crear una instancia de Writer  -----
        if (disponible === "available")
            writer = await Writer.create(options);

        else {

            writer = await Writer.create({

                ...options,

                monitor(m) {

                    m.addEventListener('downloadprogress', e => {

                        const percent = Math.round((e.loaded / e.total) * 100);
                        output.textContent = `⏳ Descargando modelo de IA Local ${percent}%`;

                    });
                }

            });
        }


        //  -----  Generar el contenido  -----
        output.textContent = '✍️ Generando texto';

        // Crear animación con puntos (...)
        let dots = 0;
        const blinkInterval = setInterval(() => {
            dots = (dots + 1) % 4; // 0 → 1 → 2 → 3 → 0
            output.textContent = '✍️ Generando texto' + '.'.repeat(dots);
        }, 500);

        try {
            const result = await writer.write(
                idea,
                {
                    context: "Ayuda al usuario a escribir desde su idea breve"
                }
            );

            // Detener animación cuando termina
            clearInterval(blinkInterval);
            output.textContent = result;

        } catch (error) {
            clearInterval(blinkInterval);
            output.textContent = '⚠️ Error al generar el texto.';
        }


    });


})();
