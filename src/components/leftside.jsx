const Dialog = ({ isOpen, close, children }) => {
    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // High z-index to ensure it covers the whole screen
    };

    const contentStyle = {
        background: 'white',
        padding: '20px',
        borderRadius: '5px',
        zIndex: 1001, // Ensures the content is above the overlay
    };

    return (
        <div style={overlayStyle} onClick={close}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                {children}
                <button onClick={close}>Close</button>
            </div>
        </div>
    );
};
function SettingComp({chatSnippet, updateChatSnippet}){
    const [isDialogOpen, setDialogOpen] = React.useState(false);
    const [botApis, setBotApis] = React.useState(Object.entries(botmethod).map(([key, value])=>({...value, botid:key})));
    //[{ name: 'goobot', apikey: '', botid: '0' }, { name: 'opebot', apikey: '', botid: '1' }, { name: 'clabot', apikey: '', botid: '2' },{ name: 'metbot', apikey: '', botid: '3' },{ name: 'cusbot', apikey: '', botid: '4' }]
    
    const handleBotApichange = (event, index)=>{
        const {key, value} = event.target
        const updatedBotApis = botApis.map((bot, i)=>{
            console.log("in handle bot change :"+bot +'  value:'+value)
            if (i == index){
                return {...bot, apikey: value}
            }
            return bot
        })
        setBotApis(updatedBotApis)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        botApis.map((item, index)=>{
            botmethod[item['botid']]['apikey'] = item['apikey']
            if (item['apikey'] ==="" &&  sessionHistory['bot'].includes(parseInt(item['botid']))){
                sessionHistory['bot'] = sessionHistory['bot'].filter(item=>item===parseInt(item['botid']))
            }
            if (item['apikey'] !="" &&  ! sessionHistory['bot'].includes(parseInt(item['botid']))){
                sessionHistory['bot'].push(parseInt(item['botid']))
            }
        })
        
        console.log('Form Data:', botmethod);
        console.log(sessionHistory['bot'])
        setDialogOpen(false); // Close the dialog on submit
    };
    // for export deleting chat, use a list of div with chat id, chat snippet, and an export button, a delete button
    const handleExport=(chatid)=>{
        alert(JSON.stringify(sessionHistory['chat'][parseInt(chatid)]))
    }
    const handleDelete=(chatid)=>{
        const userConfirmed = window.confirm("Are you sure you want to delete the chat "+chatid+"?");
        
        if (userConfirmed) {
            // User clicked 'OK'
            
            alert("Action confirmed!");
            delete sessionHistory['chat'][parseInt(chatid)]
            updateChatSnippet(Object.entries(sessionHistory['chat']).map(([key,value])=>(key>0? {chatid:key, firstprompt:value['chathistory'][0]['promptcontent']}: {chatid:key})).slice(1))
        } else {
            // User clicked 'Cancel'
            alert("Action canceled!");
        }
    }

    return (
        <div>
            <button onClick={() => setDialogOpen(true)}>Setting</button>
            <Dialog isOpen={isDialogOpen} close={() => {
                setDialogOpen(false)
                setBotApis(Object.entries(botmethod).map(([key, value])=>({...value, botid:key})))
                }}>

                
                <form onSubmit={handleSubmit}>
                    {chatSnippet.map((snippet)=>(
                        <div key={snippet['chatid']}>{'chat id '+snippet['chatid']+' content:'+snippet['firstprompt']}
                        <button type="button" onClick={()=>handleExport(snippet['chatid'])}>Export</button>
                        
                        <button type="button" onClick={()=>handleDelete(snippet['chatid'])}>Delete</button>
                        </div>
                    ))}
                    {botApis.map((bot, index)=>(
                        <div key={index}>
                            <label>{bot['name']+'_'+bot['botid']}<input type='text' name={bot['name']+'_'+bot['botid']} value={bot['apikey']} onChange={(event)=> handleBotApichange(event, index)} /></label>
                        </div>
                    ))}
                    <button type="submit">Submit</button>
                </form>
            </Dialog>
        </div>
    );
}
function SideSection({selectedChat, setSelectedChat}){
    const [chatSnippet, setChatSnippet] = React.useState(Object.entries(sessionHistory['chat']).map(([key,value])=>(key>0? {chatid:key, firstprompt:value['chathistory'][0]['promptcontent']}: {chatid:key})).slice(1))

    const updateChatSnippet = (updatedSnipped)=>{
        setChatSnippet(updatedSnipped)
        if (!(selectedChat in sessionHistory['chat'])){
            setSelectedChat(0)
        }
    }
    const handleNewChat = ()=>{
        setSelectedChat(0)
    }
    const handleSelection=(chatid)=>{
        setSelectedChat(parseInt(chatid))
    }
    const claimSelectedChat=(prediction)=>{
        return selectedChat === parseInt(prediction)? true:false
    }


    return ( <div>
                {chatSnippet.map((snippet)=>(
                        <div key={snippet['chatid']}>
                        <button type="button" style={claimSelectedChat(snippet['chatid'])? {textDecoration: 'underline'}:{}} onClick={()=>handleSelection(snippet['chatid'])}>{'chat id '+snippet['chatid']+' content:'+snippet['firstprompt']}</button>
                        </div>
                    ))}
                <div key='newchat'><button type='button' style={claimSelectedChat(0)? {textDecoration: 'underline'}:{}} onClick={()=>handleNewChat()}>New Chat</button></div>
                <SettingComp updateChatSnippet={updateChatSnippet} chatSnippet={chatSnippet}/>
            </div>
    )
}

function RootComp(){
    const [selectedChat, setSelectedChat] = React.useState(0)
    const [uuid, setID]  = React.useState(0)
    const selectChat=(chatid)=>{
        setSelectedChat(chatid)
        setID(uuid+1)
        console.log("chat id change in root component"+chatid)
    }

    return (
        <div style={{display:'flex'}}>
            <SideSection key={'side'+uuid} selectedChat={selectedChat} setSelectedChat={selectChat}/>
            <IndiChatComp key={'indi'+uuid} chatid={selectedChat} setSelectedChat={selectChat} />

        </div>
    )


}
