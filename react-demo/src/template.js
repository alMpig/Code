import React,{Component,Fragment } from 'react'
import {CSSTransition , TransitionGroup} from 'react-transition-group'
import Items from './items'

class Xiaojiejie extends Component{
    //js的构造函数，由于其他任何函数执行
    constructor(props){
        super(props) //调用父类的构造函数，固定写法
        this.state={
            inputValue:'' , // input中的值
            list:['基础按摩','精油推背'],     //服务列表
            isShow:true
        }
        this.toToggole = this.toToggole.bind(this);
    }
    render(){
        return  (
            <Fragment>
                {
                    //正确注释的写法 
                }
                <div>
                <label htmlFor="jspang">加入服务：</label>
                <input 
                    id="jspang" 
                    className="input" 
                    value={this.state.inputValue} 
                    onChange={this.inputChange.bind(this)}
                    ref={(input)=>{this.input=input}}
                />
                    <button onClick={this.addList.bind(this)}> 增加服务 </button>
                </div>
                {/* 正确注释的写法 */}
                <ul ref={(ul)=>{this.ul=ul}}>
                    <TransitionGroup>
                    {
                        this.state.list.map((item,index)=>{
                            return (
                                <CSSTransition
                                    timeout={1000}
                                    classNames='boss-text'
                                    unmountOnExit
                                    appear={true}
                                    key={index+item}  
                                >
                                    <Items 
                                    content={item}
                                    index={index}
                                    deleteItem={this.deleteItem.bind(this)}
                                    />
                                </CSSTransition>
                            )
                        })
                    }
                    </TransitionGroup>
                </ul> 
                <div>
                    <CSSTransition 
                        in={this.state.isShow}   //用于判断是否出现的状态
                        timeout={2000}           //动画持续时间
                        classNames="boss-text"   //className值，防止重复
                        unmountOnExit
                    >
                        <div>BOSS级人物-孙悟空</div>
                    </CSSTransition>
                    <div><button onClick={this.toToggole}>召唤Boss</button></div>
                </div>
            </Fragment>
        )
    }
    inputChange(){
        this.setState({
            inputValue:this.input.value
        })
    }
    // inputChange(e){  //ref
    //     this.setState({
    //         inputValue:e.target.value
    //     })
    // }
    toToggole(){
        this.setState({
            isShow:this.state.isShow ? false : true
        })
    }
    //增加服务的按钮响应方法
    addList(){
        this.setState({
            list:[...this.state.list,this.state.inputValue],
            inputValue:''
        },()=>{
            console.log(this.ul.querySelectorAll('div').length)
        })
    }
    //删除单项服务
    deleteItem(index){
        let list = this.state.list
        list.splice(index,1)
        this.setState({
            list:list
        })
        
    }
    
}
export default Xiaojiejie 