sessionHistory = {// on app open, pull from server for previous chat history. On selecting newchat, create a chatid,{nextprmoptid:0, chathistory:{}} pair. Need to make sure the chatid is unique even when no connection with server. use timestemp as seed
    chat:{
        1: {
            nextprmoptid:1, chathistory:{0:{ promptcontent:'What is this',botresponse:{0:['in english communication, there is the need for a quick reference to an object in discussion. the word this is used as such reference.\nIf you are meant to seek help identifying an object from an image, please upload the image.'], 1:['error', 'this is the end'], 2:['this is not the end']}}}
        },
        2:{nextprmoptid:0, chathistory:{}}
    },
    bot:[0,2]
}
botmethod = {
    0:'goobot',
    1:'opebot',
    2:'clobot',
    3:'metbot',
    4:'futbot'
}
function ResponseComp({apromptid, abotid, chatid, nextprmoptid}){
    /* in the next patch, just put the response that can be regenerated into a */
    //get response via bot api using prmopt (get previous chat history via bot id and promptid in root component or context)

    //display waiting animation 

    //Got result or error, display it 

    //check the latest prompt id, if matches, display regenerate option
    const [content, setContent] =useState('Initial state')
    function generateContent(){
        if (content != 'Analyzing...'){
        useEffect(() => {
            setContent('Analyzing...')
            const timer = setTimeout(() => {
                setContent('10 seconds have passed!');
                let prompt = sessionHistory[chat][chatid][chathistory][promptcontent]
                let result = 'response from bot '+botmethod[abotid]+' for prompt ' +prompt+' is bbbbbbbbbbbbb prompid: ' + apromptid+ ' botid: ' + abotid + " chatid: "+chatid+ ' nextpromptid: ' + nextprmoptid
                sessionHistory[chat][chatid][chathistory][botresponse][abotid].push(result)
                setContent(result)
            }, 10000);  // 10000 milliseconds = 10 seconds
    
            // Cleanup function to clear the timeout if the component unmounts early
            return () => clearTimeout(timer);
        }, []) // Empty dependency array means this effect runs only once after the initial render
        }

    }
    if (sessionHistory[chat][chatid][chathistory][botresponse][abotid].length === 0){
        generateContent()
    }
    let responseMarkup = <p>{content}</p>
    if (apromptid == nextprmoptid - 1){
        responseMarkup = (
            <div>
                {content}
                <button onClick={generateContent}>Regenerate</button>
            </div>
        )
    }
    else{
        responseMarkup = (
            <div>{content}</div>
        )
    }
    return responseMarkup
}
function inputComp({generatePrompt}){
    const [inputValue, setInputValue] = useState('');  // State to hold the input value
    //const [collectedData, setCollectedData] = useState([]);  // State to store collected inputs

    const handleInputChange = (event) => {
        setInputValue(event.target.value);  // Update state with current input
    };

    const handleButtonClick = () => {
        if (inputValue.trim() !== '') {  // Check if the input is not just whitespace
            //setCollectedData(prevData => [...prevData, inputValue]);  // Add input to collected data
            if (sessionHistory[bot].length === 0){
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
            <div>
                <h3>Collected Inputs:</h3>
                <ul>
                    {collectedData.map((data, index) => (
                        <li key={index}>{data}</li>  // Display collected data
                    ))}
                </ul>
            </div>
        </div>
    );

}
function promptComp({thisprompt=''}){
    return (<p style="color: blue; font-size: 16px; font-family: Arial, sans-serif;">{'this is the prmopt: '+thisprompt}</p>)
}
function IndiChatComp({chatid=2}){

    //var nextPromptID = 0
    const [nextPromptID, setNextPromptID] = useState(sessionHistory[chat][chatid][nextprmoptid])
    const [nextPrompt, setNextPrompt] = useState('')
    const [inoutpair, setNextPair] = useState(Object.entries(sessionHistory[chat][chatid][chathistory]).map(([key, value])=>[value[promptcontent], key, chatid, nextPromptID, Object.keys(value[botresponse])]))
    const collectNextPrompt=(thePrompt)=>{
        setNextPrompt(thePrompt)
        let temp_nextPrompt = {promptcontent: nextPrompt, botresponse:sessionHistory[bot].reduce((acc, key) => ({ ...acc, [key]: [] }), {})}
        sessionHistory[chat][chatid][chathistory][nextPromptID] = temp_nextPrompt
        
        setNextPair([...inoutpair,[nextPrompt, nextPromptID, chatid, nextPromptID+1, sessionHistory[bot]]])
        setNextPromptID(nextPromptID+1)

    }
    console.log(inoutpair)
    return (inoutpair.map((theprompt, thepromptid, currentchatid, thenextpromptid, botids)=>(
        <div>
            <promptComp thisprompt={theprompt}/>

            {botids.map((thebotid)=>(
                <ResponseComp apromptid={thepromptid} abotid={thebotid} chatid={currentchatid} nextprmoptid={thenextpromptid}  />
            ))}
        
        <inputComp generatePrompt={collectNextPrompt} />
        </div>
    )))
    /*// this if else block grabbed all the [prompt {botid: latest response}] from chathistory for the current chat. This will be then used to populate the individual chat section
    //var initialChat = []
    const [initialChat, setInitialChat] = useState([])
    const pushToChat=(newpair)=>{
        setInitialChat([...initialChat, newpair])
    }
    if (chatid in sessionHistory['chat']){
        let initialChat_temp = sessionHistory['chat'][chatid]
        //nextPromptID=initialChat_temp[nextprmoptid]
        setNextPromptID(initialChat_temp[nextprmoptid])
        initialChat_temp[chathistory].forEach(promptid=>{
            var promptresponse = initialChat_temp[chathistory][promptid][promptcontent]
            let response_temp = {}
            Object.keys(initialChat_temp[chathistory][promptid][botresponse]).forEach(key=>{
                response_temp.key=promptPair[botresponse][key].at(-1)
            })
            promptresponse.push(response_temp)
            //initialChat.push(promptresponse)
            pushToChat( promptresponse)
        }
        )
    }
    else{

    }*/


}
