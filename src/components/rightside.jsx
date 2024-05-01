const sessionHistory = {// on app open, pull from server for previous chat history. On selecting newchat, create a chatid,{nextprmoptid:0, chathistory:{}} pair. Need to make sure the chatid is unique even when no connection with server. use timestemp as seed
    chat:{
        0:{nextprmoptid:0, chathistory:{}},// when open new chat, initialize it as this chat id 0. When the first prompt is submitted, switch it to the next avaialbe chat id
        1: {
            nextprmoptid:2, chathistory:{0:{ promptcontent:'What is this',botresponse:{0:['in english communication, there is the need for a quick reference to an object in discussion. the word this is used as such reference.\nIf you are meant to seek help identifying an object from an image, please upload the image.'], 1:['error', 'this is the end'], 2:['this is not the end']}},
            1:{ promptcontent:'What is that',botresponse:{0:['in english communication, there is the need for a quick reference to a distant object in discussion. the word that is used as such reference.\nIf you are meant to seek help identifying an object from an image, please upload the image.'], 1:['that is funny'], 2:['that is a word in english']}}}
        },
        2:{nextprmoptid:1, chathistory:{0:{promptcontent:'Have we met before', botresponse:{2:['I do not know what you are talking about'], 4:['no, cuz I am you']}}}},

    },
    bot:[0,2],
    thischat:0
}
const botmethod = {
    0:{name:'goobot',apikey:''},
    1:{name:'opebot',apikey:''},
    2:{name:'clabot',apikey:''},
    3:{name:'metbot',apikey:''},
    4:{name:'cusbot',apikey:''}
}
function ResponseComp({apromptid, abotid, chatid, nextprmoptid, signal}){
    /* in the next patch, just put the response that can be regenerated into a */
    //get response via bot api using prmopt (get previous chat history via bot id and promptid in root component or context)

    //display waiting animation 

    //Got result or error, display it 

    //check the latest prompt id, if matches, display regenerate option
    const [content, setContent] = React.useState('Initial state')

    React.useEffect(() => {
        //setContent('Analyzing...')
        if (!signal) return;

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
            const timer = setTimeout(() => {
                    setContent('10 seconds have passed!');
                    let prompt = sessionHistory['chat'][chatid]['chathistory'][apromptid]['promptcontent']
                    let result = 'response from bot '+botmethod[abotid]['name']+' for prompt ' +prompt+' is bbbbbbbbbbbbb prompid: ' + apromptid+ ' botid: ' + abotid + " chatid: "+chatid+ ' nextpromptid: ' + nextprmoptid
                    sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid].pop()
                    sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid].push(result)
                    setContent(result)
                    console.log('from asnyc:  '+result)
                }, 10000);  // 10000 milliseconds = 10 seconds
        
                // Cleanup function to clear the timeout if the component unmounts early
            return () => {
                clearTimeout(timer)
                console.log('aborted in'+ 'response from bot '+botmethod[abotid]['name']+' for prompt ' +sessionHistory['chat'][chatid]['chathistory'][apromptid]['promptcontent']+' is bbbbbbbbbbbbb prompid: ' + apromptid+ ' botid: ' + abotid + " chatid: "+chatid+ ' nextpromptid: ' + nextprmoptid)
            }
        }

    }, [content, signal]) // Empty dependency array means this effect runs only once after the initial render
     
    /*function generateContent(){
        if (content != 'Analyzing...'){
            React.useEffect(() => {
            setContent('Analyzing...')
            const timer = setTimeout(() => {
                setContent('10 seconds have passed!');
                let prompt = sessionHistory['chat'][chatid]['chathistory']['promptcontent']
                let result = 'response from bot '+botmethod[abotid]+' for prompt ' +prompt+' is bbbbbbbbbbbbb prompid: ' + apromptid+ ' botid: ' + abotid + " chatid: "+chatid+ ' nextpromptid: ' + nextprmoptid
                sessionHistory['chat'][chatid]['chathistory']['botresponse'][abotid].push(result)
                setContent(result)
            }, 10000);  // 10000 milliseconds = 10 seconds
    
            // Cleanup function to clear the timeout if the component unmounts early
            return () => clearTimeout(timer);
        }, []) // Empty dependency array means this effect runs only once after the initial render
        }

    }*/
    //console.log('bot id:'+abotid)
    //console.log(content)
    //console.log(sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid].length)
    //console.log(sessionHistory['chat'][chatid]['chathistory'][apromptid]['botresponse'][abotid])
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


function IndiChatComp({chatid}){
    console.log(sessionHistory)
    const [controller, setController] = React.useState(null);
    //var nextPromptID = 0
    const [nextPromptID, setNextPromptID] = React.useState(sessionHistory['chat'][chatid]['nextprmoptid'])
    const [nextPrompt, setNextPrompt] = React.useState('')
    const [inoutpair, setNextPair] = React.useState(Object.entries(sessionHistory['chat'][chatid]['chathistory']).map(([key, value])=>[value['promptcontent'], key, chatid,  Object.keys(value['botresponse'])]))
    React.useEffect(() => {
        // Initialize the controller
        setController(new AbortController());

        // Cleanup function to abort fetch when component unmounts
        return () => {
            if (controller) {
                controller.abort();
            }
        };
    }, []);
    const handleAbort = () => {
        if (controller) {
            controller.abort();
            console.log('Fetch aborted by parent');
            // Re-initialize the controller if needed again after aborting
            
        }
    };
    React.useEffect(()=>{

        handleAbort()
        setNextPromptID(sessionHistory['chat'][chatid]['nextprmoptid'])
        setNextPrompt('')
        setNextPair(Object.entries(sessionHistory['chat'][chatid]['chathistory']).map(([key, value])=>[value['promptcontent'], key, chatid,  Object.keys(value['botresponse'])]))
        console.log('effect has been used by '+chatid)
    }, [chatid])

    const collectNextPrompt=(thePrompt)=>{
        setNextPrompt(thePrompt)
        let temp_nextPrompt = {promptcontent: thePrompt, botresponse:sessionHistory['bot'].reduce((acc, key) => ({ ...acc, [key]: [] }), {})}
        sessionHistory['chat'][chatid]['chathistory'][nextPromptID] = temp_nextPrompt
        sessionHistory['chat'][chatid]['nextprmoptid'] = nextPromptID+1
        console.log("the next prompt: "+thePrompt)
        console.log(nextPrompt)
        setNextPair([...inoutpair,[thePrompt, nextPromptID, chatid,  sessionHistory['bot']]])
        setNextPromptID(nextPromptID+1)

    }

    console.log('here is the debug output in indichat '+chatid)
    console.log(inoutpair)
    return (
        <div>
        {inoutpair.map(([theprompt, thepromptid, currentchatid,  botids])=>(
        <div key={chatid+'_'+thepromptid}>
            <PromptComp key={chatid+'_'+thepromptid} thisprompt={theprompt}/>
            {console.log('populating bots botids is:'+botids)}
            {console.log('still in the populating process',theprompt, thepromptid, currentchatid,  botids)}
            {botids.map((thebotid)=>(
                <ResponseComp  key={chatid+'_'+thepromptid+'_'+thebotid} apromptid={thepromptid} abotid={thebotid} chatid={chatid} nextprmoptid={nextPromptID} signal={controller ? controller.signal : null} />
            ))}
        
        
        </div>
    ))}
    <InputComp generatePrompt={collectNextPrompt} /></div>
)

}
