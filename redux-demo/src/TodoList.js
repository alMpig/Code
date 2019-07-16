import React, { Component } from 'react';
import store from './store';
import {changeInputAction , addItemAction ,deleteItemAction,getListAction} from './store/actionCreators';
import TodoListUI from './TodoListUI'
import axios from 'axios'

class TodoList extends Component {
    componentDidMount(){
        axios.get('https://www.easy-mock.com/mock/5cfcce489dc7c36bd6da2c99/xiaojiejie/getList').then((res)=>{    
            const data = res.data
            const action = getListAction(data)
            store.dispatch(action)
        })
    }
    constructor(props){
        super(props)
        this.state=store.getState();
        this.changeInputValue= this.changeInputValue.bind(this)
        this.storeChange = this.storeChange.bind(this)  //转变this指向
        this.clickBtn = this.clickBtn.bind(this)
        store.subscribe(this.storeChange) //订阅Redux的状态
    }
    render() { 
        return ( 
            <TodoListUI 
                inputValue={this.state.inputValue}
                list={this.state.list}
                changeInputValue={this.changeInputValue}
                clickBtn={this.clickBtn}
                deleteItem={this.deleteItem}
            />
         );
    }
    storeChange(){
        this.setState(store.getState())
    }
    changeInputValue(e){
        const action = changeInputAction(e.target.value)
        store.dispatch(action)
    }
    clickBtn(){
        const action = addItemAction()
        store.dispatch(action)
    }
    deleteItem(index){
        const action = deleteItemAction(index)
        store.dispatch(action)
    }
}
export default TodoList;