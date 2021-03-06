    class BaseField extends React.Component{
        constructor(props){
            super(props);
            let self=this;
            let cells=[];
            for(let i=0;i<this.props.height;i++){
                cells[i]=[];
                for (let j=0;j<this.props.width;j++){
                    cells[i][j]={
                        value:'-',
                        receivedTime:null,
                        opacityValue:1.0,
                        isSelected:false
                    }
                }
            }
            this.state={
                cells:cells,
                timer:null
            };
        }

        componentDidMount(){
            if (this.state.timer)
                clearInterval(this.state.timer);
            this.state.timer=setInterval(this.componentStateHandler.bind(this),500);
        }

        componentStateHandler(){
            for(let i=0;i<this.state.cells.length;i++){
                for (let j=0;j<this.state.cells[i].length;j++){
                    if (this.state.cells[i][j].receivedTime){
                        let exprTime=new Date();
                        exprTime.setSeconds(exprTime.getSeconds());
                        let diffTime=Math.trunc((exprTime-this.state.cells[i][j].receivedTime)/1000);
                        if (diffTime>=0 && diffTime<=5){
                            let opacityValueToSet=1-10/5*diffTime/10;
                            this.state.cells[i][j].opacityValue=opacityValueToSet;
                            if (opacityValueToSet<=0){
                                this.state.cells[i][j].isSelected=false;
                            }
                        }
                        else{
                            this.state.cells[i][j].receivedTime=null;
                        }
                    }
                }
            }
            this.setState({cells:this.state.cells});
        }

        /*changeState(cells){
            this.setState({cells:cells});
        }*/

        render(){
            let extraCells=[];
            for (let i=0;i<this.props.height;i++){
                for (let j=0;j<this.props.width;j++){
                    if (this.state.cells[i][j].isSelected){
                        extraCells[extraCells.length]=this.state.cells[i][j];
                    }
                }
            }
            return <div className={'area'}><ExtraTable cells={extraCells}/><MainTable parent={this} cells={this.state.cells}/></div>;
        }
    }

    class MainTable extends React.Component{
        constructor(props){
            super(props);
            this.state={
                cells:this.props.cells
            }

            var ws = new WebSocket("ws://192.168.99.100:8888/websocket");
            let self=this;
            ws.onmessage = function (evt) {
                let json=JSON.parse(evt.data);
                self.cellEventHandler(json.x,json.y,json.n,false);
            };
        }

        /*cellUpdate(i,j){
            if (this.state.cells[i][j].opacityValue>0){
                this.state.cells[i][j].opacityValue-=0.2;
                this.props.parent.setState({cells:this.state.cells});
            }
            else{
                this.state.cells[i][j].isSelected=false;
                clearInterval(this.state.cells[i][j].timer);
                
                this.props.parent.setState({cells:this.state.cells});
            }
        }*/

        cellEventHandler(i,j,value=null, isMouseClick=false){
            /*if (this.state.cells[i][j].timer){
                    clearInterval(this.state.cells[i][j].timer);
                }*/
            if (value){
                this.state.cells[i][j].value=value;
            }
            if (isMouseClick)
                this.state.cells[i][j].isSelected=true;
            else{
                this.state.cells[i][j].receivedTime=new Date();
                //this.state.cells[i][j].timer=setInterval(this.cellUpdate.bind(this),1000,i,j);
            }
            

            this.props.parent.setState({cells:this.state.cells});
        }

        render(){
            return (<table>
                    <tbody>
                        {this.state.cells.map((item,index)=> (<tr key={index}>{item.map((cell,cellIndex)=> <TableCell key={index+'_'+cellIndex} receivedTime={item.receivedTime} isSelected={item.isSelected} value={cell.value} opacityValue={cell.opacityValue} onClick={()=>this.cellEventHandler(index,cellIndex,null,true)}/>)}</tr> ))}
                    </tbody>
                </table>);
        }
    }

    class ExtraTable extends React.Component{
        render(){
            return (<table>
                        <tbody>
                            {this.props.cells.map((item,index)=>(<tr key={index}><TableCell value={item.value} isSelected={item.isSelected} opacityValue={item.opacityValue}/></tr>))}
                        </tbody>
                </table>);
        }
    }

    class TableCell extends React.Component{
        constructor(props){
            super(props);
        }

        shouldComponentUpdate() {
            return this.props.receivedTime!==null || this.props.opacityValue>0 || this.props.isSelected===true;
        }

        render(){
            return (<td onClick={()=>this.props.onClick()}><span style={{opacity:this.props.opacityValue,color:(this.props.value<0?'#0000FF':'#FF0000')}}>{this.props.value}</span></td>);
        }
    }
    ReactDOM.render(<BaseField height={30} width={30}/>,document.getElementById('root'));