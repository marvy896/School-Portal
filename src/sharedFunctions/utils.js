//This contais shared fuctionalities for the web Page

let removeColumn =(data, nameOfColumn) =>{
    return data.map(
      row => {
       let Row = {...row}
       delete Row[nameOfColumn]
       return Row
      }
    )
  }
  export {removeColumn};