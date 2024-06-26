const sessionHistory = {// on app open, pull from server for previous chat history. On selecting newchat, create a chatid,{nextprmoptid:0, chathistory:{}} pair. Need to make sure the chatid is unique even when no connection with server. use timestemp as seed
    chat:{
        0:{nextprmoptid:0, chathistory:{}},// when open new chat, initialize it as this chat id 0. When the first prompt is submitted, switch it to the next avaialbe chat id
        1: {
            nextprmoptid:2, chathistory:{0:{ promptcontent:'What is this',botresponse:{0:['in english communication, there is the need for a quick reference to an object in discussion. the word this is used as such reference.\nIf you are meant to seek help identifying an object from an image, please upload the image.'], 1:['error', 'this is the end'], 2:['this is not the end']}},
            1:{ promptcontent:'What is that',botresponse:{0:['in english communication, there is the need for a quick reference to a distant object in discussion. the word that is used as such reference.\nIf you are meant to seek help identifying an object from an image, please upload the image.'], 1:['that is funny'], 2:['that is a word in english']}}}
        },
        2:{nextprmoptid:1, chathistory:{0:{promptcontent:'Have we met before', botresponse:{2:['I do not know what you are talking about'], 4:['no, cuz I am you']}}}},

    },
    bot:[],
    thischat:0
}
const botmethod = {
    0:{name:'goobot',apikey:'', apicall:async (apikey, prompt="hit me with a joke", partial_result, update_func) => {
        const apiKey = apikey;  // Caution: Exposing API keys client-side is risky.
        const model = 'gemini-pro';    // Choose your model appropriately.
    
        try {
            
            const response = await fetch('https://cors-anywhere.herokuapp.com/https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key='+apikey, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    contents: [{ "role": "user", "parts": [{'text':prompt}] }],
                })
            });
            
            const data = await response.json();
            if (!response.ok) {
                console.error('HTTP Error:', response.status, JSON.stringify(data));
                throw new Error('HTTP error! Status: ' + response.status);
            }
    
            console.log(data);
    
    
            let final_response = partial_result + JSON.stringify(data)
            update_func(final_response)
            //return data;
        } catch (error) {
            console.error('Request failed:', error);
        }
    }},
    1:{name:'opebot',apikey:'', apicall:async (apikey, prompt="hit me with a joke", partial_result, update_func) => {
        const apiKey = apikey;  // Caution: Exposing API keys client-side is risky.
        const model = 'gpt-3.5-turbo';    // Choose your model appropriately.
    
        try {
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ "role": "user", "content": prompt }],
                    max_tokens: 50
                })
            });
            
            const data = await response.json();
            if (!response.ok) {
                console.error('HTTP Error:', response.status, JSON.stringify(data));
                throw new Error('HTTP error! Status: ' + response.status);
            }
    
            console.log(data);


            let final_response = partial_result + JSON.stringify(data)
            update_func(final_response)
            //return data;
        } catch (error) {
            console.error('Request failed:', error);
        }
    }},
    2:{name:'clabot',apikey:'',apicall:async (apikey, prompt="hit me with a joke", partial_result, update_func) => {
        const apiKey = apikey;  // Caution: Exposing API keys client-side is risky.
        const model = 'claude-3-haiku-20240307';    // Choose your model appropriately.
    
        try {
            
            const response = await fetch('https://cors-anywhere.herokuapp.com/https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    "anthropic-version": "2023-06-01",
                    'Content-Type': 'application/json',
                    'x-api-key': `${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ "role": "user", "content": prompt }],
                    max_tokens: 50
                })
            });
            
            const data = await response.json();
            if (!response.ok) {
                console.error('HTTP Error:', response.status, JSON.stringify(data));
                throw new Error('HTTP error! Status: ' + response.status);
            }
    
            console.log(data);
    
    
            let final_response = partial_result + JSON.stringify(data)
            update_func(final_response)
            //return data;
        } catch (error) {
            console.error('Request failed:', error);
        }
    }},
    3:{name:'metbot',apikey:''},
    4:{name:'cusbot',apikey:''}
}
function ResponseComp({apromptid, abotid, chatid, nextprmoptid}){
    /* in the next patch, just put the response that can be regenerated into a */
    //get response via bot api using prmopt (get previous chat history via bot id and promptid in root component or context)

    //display waiting animation 

    //Got result or error, display it 

    //check the latest prompt id, if matches, display regenerate option
    const [content, setContent] = React.useState('Initial state')

    React.useEffect(() => {
        //setContent('Analyzing...')


        if (content === 'Initial state'){
            if ( sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid].length > 0){
                setContent('bot id '+abotid+' got this: '+sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid].at(-1))
            }
            else{
                setContent('Analyzing...')
            }
        }
        else if (content === 'Analyzing...'){
            setContent('Analyzing...')
            sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid].push('generating new response')
            if (parseInt(abotid)===0 || parseInt(abotid)===1 || parseInt(abotid)===2){
                let prompt = sessionHistory['chat'][chatid]['chathistory'][apromptid]['promptcontent']
                let partial_result = 'response from bot '+botmethod[abotid]['name']+' for prompt ' +prompt+'  prompid: ' + apromptid+ ' botid: ' + abotid + " chatid: "+chatid+ ' nextpromptid: ' + nextprmoptid + ' response:'
                botmethod[abotid]['apicall'](botmethod[abotid]['apikey'], prompt, partial_result, (finalresponse)=>{
                    sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid].pop()
                    sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid].push(finalresponse)
                    setContent(finalresponse)
                })
                
            }
            else{
                const timer = setTimeout(() => {
                        setContent('10 seconds have passed!');
                        let prompt = sessionHistory['chat'][chatid]['chathistory'][apromptid]['promptcontent']
                        let result = 'response from bot '+botmethod[abotid]['name']+' for prompt ' +prompt+' is bbbbbbbbbbbbb prompid: ' + apromptid+ ' botid: ' + abotid + " chatid: "+chatid+ ' nextpromptid: ' + nextprmoptid
                        sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid].pop()
                        sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid].push(result)
                        setContent(result)
                        console.log('from asnyc:  '+result)
                    }, 2000);  // 10000 milliseconds = 10 seconds
            
                    // Cleanup function to clear the timeout if the component unmounts early
                return () => {
                    clearTimeout(timer)
                    console.log('aborted in'+ 'response from bot '+botmethod[abotid]['name']+' for prompt ' +sessionHistory['chat'][chatid]['chathistory'][apromptid]['promptcontent']+' is bbbbbbbbbbbbb prompid: ' + apromptid+ ' botid: ' + abotid + " chatid: "+chatid+ ' nextpromptid: ' + nextprmoptid)
                }
            }
        }

    }, [content]) // Empty dependency array means this effect runs only once after the initial render
     

    //console.log('bot id:'+abotid)
    //console.log(content)
    //console.log(sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid].length)
    //console.log(sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid])
    console.log('currently rendering '+[apromptid, abotid, chatid, nextprmoptid])
    let responseMarkup = <p>{content}</p>
    if (apromptid == nextprmoptid - 1){
        responseMarkup = (
            <div key={chatid+'_'+apromptid+'_'+abotid}>
                {content}
                <button onClick={()=>setContent('Analyzing...')}>Regenerate</button>
            </div>
        )
    }
    else{
        responseMarkup = (
            <div key={chatid+'_'+apromptid+'_'+abotid}>{content}</div>
        )
    }
    return responseMarkup
}
function InputComp({generatePrompt}){
    const [inputValue, setInputValue] = React.useState('');  // State to hold the input value
    //const [collectedData, setCollectedData] = React.useState([]);  // State to store collected inputs

    const handleInputChange = (event) => {
        setInputValue(event.target.value);  // Update state with current input
    };

    const handleButtonClick = () => {
        if (inputValue.trim() !== '') {  // Check if the input is not just whitespace
            //setCollectedData(prevData => [...prevData, inputValue]);  // Add input to collected data
            if (sessionHistory['bot'].length === 0){
                alert("No bot is configured! Please configure a bot first before continue!")
            }
            else{
                generatePrompt(inputValue)

                setInputValue('');  // Clear input field after collecting data
            }
        }
    };
    return (
        <div>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter some text"
            />
            <button onClick={handleButtonClick}>Collect Input</button>
            
        </div>
    );

}
function PromptComp({thisprompt=''}){
    return (<p style={{ color: 'blue', fontSize: '16px', fontFamily: 'Arial, sans-serif' }}>{'this is the prmopt: '+thisprompt}</p>)
}


function IndiChatComp({chatid, setSelectedChat}){
    console.log(sessionHistory)
    //var nextPromptID = 0
    const [nextPromptID, setNextPromptID] = React.useState(sessionHistory['chat'][chatid]['nextprmoptid'])
    const [inoutpair, setNextPair] = React.useState(Object.entries(sessionHistory['chat'][chatid]['chathistory']).map(([key, value])=>[value['promptcontent'], key, chatid,  Object.keys(value['botresponse'])]))

    const collectNextPrompt=(thePrompt)=>{
        let temp_nextPrompt = {promptcontent: thePrompt, botresponse:sessionHistory['bot'].reduce((acc, key) => ({ ...acc, [key]: [] }), {})}

        if (chatid===0){
            let newchatid = Math.max(...Object.keys(sessionHistory['chat']).map((e)=>parseInt(e)))+1
            sessionHistory['chat'][newchatid] = {nextprmoptid:0, chathistory:{}}
            sessionHistory['chat'][newchatid]['chathistory'][nextPromptID] = temp_nextPrompt
            sessionHistory['chat'][newchatid]['nextprmoptid'] = nextPromptID+1
            console.log("generating new chat with chatid: "+newchatid)      
            setSelectedChat(newchatid)
        }
        else{
            sessionHistory['chat'][chatid]['chathistory'][nextPromptID] = temp_nextPrompt
            sessionHistory['chat'][chatid]['nextprmoptid'] = nextPromptID+1
            console.log("the next prompt: "+thePrompt)
            console.log('after a new prompt is input: '+[thePrompt, nextPromptID, chatid,  sessionHistory['bot']])
            setNextPair([...inoutpair,[thePrompt, nextPromptID, chatid,  Array.from(sessionHistory['bot'])]]) //sessionHistory['bot'])]])  //<---- this caused error cause array is used by reference. The initialization created a brand new array, but future prompt are using the same bot array, when a new bot is added after a new prompt, null reference error is triggered
            setNextPromptID(nextPromptID+1)
        }
    }
//{apromptid, abotid, chatid, nextprmoptid}
    console.log('here is the debug output in indichat '+chatid)
    console.log(inoutpair)
    return (
        <div>
        {inoutpair.map(([theprompt, thepromptid, currentchatid,  botids])=>(
        <div key={chatid+'_'+thepromptid}>
            <PromptComp key={chatid+'_'+thepromptid} thisprompt={theprompt}/>
            {console.log('populating bots botids is:'+botids)}
            {console.log('still in the populating process',theprompt, thepromptid, currentchatid,  botids)}
            {botids.map((thebotid)=>{console.log('just populated bot id:'+thebotid)
            return (
                
                <ResponseComp  key={chatid+'_'+thepromptid+'_'+thebotid} apromptid={thepromptid} abotid={thebotid} chatid={chatid} nextprmoptid={nextPromptID} />
            )})}
        
        
        </div>
    ))}
    <InputComp generatePrompt={collectNextPrompt} /></div>
)

}
