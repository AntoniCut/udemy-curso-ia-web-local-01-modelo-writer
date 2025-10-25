/*
    ----------------------------------------------
    ----------  /udemy.antonydev.tech/  ----------
    ----------  /curso-ia-web-local/  ------------
    ----------  /01-modelo-writer/  --------------
    ----------  /main.js  ------------------------
    ----------------------------------------------
*/

//@ts-check

(() => {

    /**
     * Referencia al modelo Writer disponible en window.
     * @type {{ 
       *  availability: () => Promise<"available" | "unavailable" | "local-required">,
       *  create: (options: any) => Promise<any>
       * } | undefined}
     */
    
    // @ts-ignore
    const Writer = window.Writer;

    /** 
     * Instancia del modelo Writer 
     * @type {any} 
     */
    let writer;

    /** Botón para generar el texto @type {HTMLButtonElement|null} */
    const generateBtn = document.querySelector('#generate');

    if (!generateBtn) throw new Error('No se encontró el elemento #generate');
    

    generateBtn.addEventListener('click', async () => {

        /**  
         * Campo de entrada de idea inicial 
         * @type {HTMLInputElement|null} 
         */
        const ideaInput = document.querySelector('#idea');
       
        /**  
         * Selector de tono 
         * @type {HTMLSelectElement|null} 
         */
        const toneSelect = document.querySelector('#tone');

        /**  
         * Selector de longitud 
         * @type {HTMLSelectElement|null} 
         */
        const lengthSelect = document.querySelector('#length');
        
        const idea = ideaInput?.value.trim() || '';
        const tone = toneSelect?.value || '';
        const length = lengthSelect?.value || '';

        /**  
         * Contenedor donde se muestra el resultado  
         * @type {HTMLDivElement|null} 
         */
        const output = document.querySelector('#output');
        
        if (!output) throw new Error('No se encontró el elemento #output');

        output.textContent = '⏳ Comprobando Disponibilidad...';


        //  -----  Comprobar compatibilidad con Writer  -----

        if (!Writer) {
            output.textContent = '⚠️ Lo siento, tu navegador no es compatible con Writer.';
            return;
        }

        //  -----  Comprobar disponibilidad  -----
        /**  
         * Estado de disponibilidad del modelo Writer  
         * @type {"available" | "unavailable" | "local-required"}  
         */
        const disponible = await Writer.availability();

        if (disponible === "unavailable") {
            output.textContent = '⚠️ Lo siento, Writer no está disponible en este momento. Inténtalo de nuevo más tarde.';
            return;
        }

        //  -----  Definir las opciones del prompt  -----
        /**
         * Opciones para la instancia de Writer
         * @typedef {Object} WriterOptions
         * @property {string} tone - Tono del texto
         * @property {string} length - Longitud del texto
         * @property {string} format - Formato del texto
         * @property {string} sharedContext - Contexto compartido para el modelo
         */

        /** @type {WriterOptions} */
        const options = {
            tone,
            length,
            format: "plain-text",
            sharedContext: "contenido generado desde una idea inicial del usuario"
        };


        //  -----  Crear una instancia de Writer  -----
        if (disponible === "available") {
            writer = await Writer.create(options);
        } else {
            writer = await Writer.create({
                ...options,

                /**
                 * Monitorea el progreso de descarga del modelo local
                 * @param {{ addEventListener: (event: string, callback: (e: ProgressEvent) => void) => void }} m
                 */
                monitor(m) {
                    m.addEventListener('downloadprogress', (e) => {
                        if (e.lengthComputable) {
                            const percent = Math.round((e.loaded / e.total) * 100);
                            output.textContent = `⏳ Descargando modelo de IA Local ${percent}%`;
                        }
                    });
                }
            });
        }

        //  -----  Generar el contenido  -----
        output.textContent = '✍️ Generando texto';

        //  -----  Crear animación con puntos (...)  -----
        let dots = 0;

        /** 
        * Intervalo para la animación de puntos 
        * @type {ReturnType<typeof setInterval>} 
        */
        const blinkInterval = setInterval(() => {
            dots = (dots + 1) % 4; // 0 → 1 → 2 → 3 → 0
            output.textContent = '✍️ Generando texto' + '.'.repeat(dots);
        }, 500);

        try {

            /** @type {string|undefined}  Resultado generado por Writer */
            const result = await writer?.write(idea, {
                context: "Ayuda al usuario a escribir desde su idea breve"
            });

            clearInterval(blinkInterval);
            output.textContent = result || '⚠️ No se generó texto.';

        } catch (error) {
            clearInterval(blinkInterval);
            output.textContent = '⚠️ Error al generar el texto.';
            console.error(error);
        }

    });


})();
