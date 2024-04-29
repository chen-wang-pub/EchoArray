function SettingComp(){
    const [isDialogOpen, setDialogOpen] = React.useState(false);
    const [botApis, setBotApis] = React.useState(Object.entries(botmethod).map(([key, value])=>({...value, botid:key})));
    //[{ name: 'goobot', apikey: '', botid: '0' }, { name: 'opebot', apikey: '', botid: '1' }, { name: 'clabot', apikey: '', botid: '2' },{ name: 'metbot', apikey: '', botid: '3' },{ name: 'cusbot', apikey: '', botid: '4' }]
    const [chatSnippet, setChatSnippet] = React.useState(Object.entries(sessionHistory['chat']).map(([key,value])=>(key>0? {chatid:key, firstprompt:value['chathistory'][0]['promptcontent']}: {chatid:key})).slice(1))
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
            setChatSnippet(Object.entries(sessionHistory['chat']).map(([key,value])=>(key>0? {chatid:key, firstprompt:value['chathistory'][0]['promptcontent']}: {chatid:key})).slice(1))
        } else {
            // User clicked 'Cancel'
            alert("Action canceled!");
        }
    }

    return (
        <div className="App">
            <button onClick={() => setDialogOpen(true)}>Open Dialog</button>
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
