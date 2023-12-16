/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const fetch = require('node-fetch');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hola, puedo darte las citas que tienes programadas, solo tienes que decir, citas de y tu dni completo, tambien puedo darte el resumen de un paciente para esto di, dime el resumen de y el dni del paciente .';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CitasMedicasHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'getCitasMedicas';
    },
    async handle(handlerInput) {
        // Configuración de la petición
        const { medico } = handlerInput.requestEnvelope.request.intent.slots;
        const medicoString = medico.value.toUpperCase();
        //medico = "12345678L";
        let url = "https://p-citas-api.us-e2.cloudhub.io/api/appointments/practitioner/";
        url += medicoString + "?client-id=93d919d6-777f-451f-a90d-2d750801f6d4&client-secret=5ced3f9a728c9de996ebe0a3f3ce2105867c9ec749b729ffba0a2c1635dab12e";
        console.log(medico);
        console.log(medicoString);
        console.log(url);
        let i=0;
        let c=0;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                }
            });

            if (!response.ok) {
                const salida = 'Error en la solicitud, vuelve a repetir la orden';
                console.log("fallo en url");
                return handlerInput.responseBuilder
                    .speak(salida)
                    .getResponse();
            }
            
            const data = await response.json();
            console.log(data);
            let salida = 'Hola ';

            // Verificar si la propiedad 'appointments' existe en la respuesta (debería)
            if (data && data.appointments && Array.isArray(data.appointments) && data.appointments.length > 0) {
                // Iterar a través de cada cita médica
                data.appointments.forEach(cita => {
                    // Acceder a los datos específicos de cada cita

                    const patient = cita.patient;
                    const medico = cita.practitioner;
                    const hora = cita.start;
                    const descripcion = cita.description;

                    const fechaObjeto = new Date(hora); 
                    const fechaActual = new Date();
                    
                    diaCita = fechaObjeto.getDate();
                    mesCita = fechaObjeto.getMonth();
                    anoCita = fechaObjeto.getFullYear();

                    diaHoy = fechaActual.getDate();
                    mesHoy = fechaActual.getMonth();
                    anoHoy = fechaActual.getFullYear();

                    // Aqui volvemos a comprobar si el Appointment tiene la fecha de hoy ya que en OpenMRS la peticion nos devuelve todos los appointments del medico 
                    // (esto es porque en la api de OpenMRS no nos deja filtrar por fechas mientras que en la de Medplum si)

                    if (diaCita == diaHoy && mesCita == mesHoy && anoCita == anoHoy) {
                        
                        var horas = fechaObjeto.getHours();
                        var minutos = fechaObjeto.getMinutes();

                        if(i==0){
                            salida += medico + ', tienes una cita con ' + patient + ' a las ' + horas + ":" + minutos + ', el motivo de la visita es: ' + descripcion;
                        }else{
                            salida += ' Tienes una cita con ' + patient + ' a las ' + horas + ":" + minutos + ', el motivo de la visita es: ' + descripcion;
                        }
                        i++;
                        c++;
                    } 

                   
                });
            }else{
                salida += ', no tienes citas hoy.';
            }
            //En el caso de que OpenMRS no tenga citas hoy c seguira siendo 0
            if(c==0){salida="No tienes citas hoy.";}
            
            return handlerInput.responseBuilder
                .speak(salida)
                .getResponse();

        } catch (error) {
            // Manejar errores
            const salida = 'Error, vuelve a intentarlo';
            return handlerInput.responseBuilder
                .speak(salida)
                .getResponse();
        }
    }
}

const ResumenPacienteHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'getInfoPaciente';
    },
    async handle(handlerInput) {
        // Configuración de la petición
        const { paciente } = handlerInput.requestEnvelope.request.intent.slots;
        const pacienteString = paciente.value.toUpperCase();
        

        let url = "https://p-pacientes-api.us-e2.cloudhub.io/api/patient/";
        url += pacienteString + "/medicalSummary?client-id=93d919d6-777f-451f-a90d-2d750801f6d4&client-secret=5ced3f9a728c9de996ebe0a3f3ce2105867c9ec749b729ffba0a2c1635dab12e";
        console.log(url);

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                }
            });

            if (!response.ok) {
                const salida = 'Error en la solicitud, vuelve a repetir la orden';
                console.log("fallo en url");
                return handlerInput.responseBuilder
                    .speak(salida)
                    .getResponse();
            }
            console.log("entra al get");
            const data = await response.json();
            console.log(data);
            let salida = 'Hola, el resumen generado por IA de los datos del paciente es: ';

            // Verificar si la propiedad 'appointments' existe en la respuesta (debería)
            if (data && data.message) {
                // Iterar a través de cada cita médica
                salida += data.message;
            }else{
                
            }
            
            return handlerInput.responseBuilder
                .speak(salida)
                .getResponse();

        } catch (error) {
            // Manejar errores
            const salida = 'Error, vuelve a intentarlo';
            return handlerInput.responseBuilder
                .speak(salida)
                .getResponse();
        }
    }

}

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Que tengas un buen dia, sigue ayudando a la gente';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CitasMedicasHandler,
        ResumenPacienteHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();