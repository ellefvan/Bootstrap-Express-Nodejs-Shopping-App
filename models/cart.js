//create cart constructor object
module.exports = function Cart(oldCart) {
    /*set cart items as an empty array
    this.items = [];
    This structure will not work once the add function is called (the array
    is null & you are trying to find the idth # in it)
    we still want to recreate the cart, so pass the items from the old cart
    to the constructor & create an object where the key is add's id

    //store total quanity; initially set as 0
    this.totalQty = 0;
    //store total price of items in cart
    this.totalPrice = 0;
    */
    /*this.items = oldCart.items;
    this.totalQty = oldCart.totalQty;
    this.totalPrice = oldCart.totalPrice;
    Use Boolean OR to set variables equal to {} if the first option is 
    null
    */
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;
    

    /* we want to group the same pokemon cards together
        whenever we add a new item, we will create a new cart from the
        old cart
        when we do this, we want to check if a product id already exists
        in the cart, if so we will only update the quanitity
        */
    this.add = function(item, id) {
        /*save existing items as a new variable and check to see if
        id already exists*/
        var storedItem = this.items[id];
        /**
         * check if item has been added to the cart yet
         */
        if (!storedItem) {
            /** create new stored item & assign to new object
             * add item from parameter
             * increment item & qty in next step
             */
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    };

    /**create the opposite of the add function 
     * adjust the price by subtracting the price of one item from the 
     * price of the total group; this is the same for the aggregate of
     * the item group and the total price amount
     * 
     * if the qty of the item is < or = to 0, then remove the item
    */
    this.reduceByOne = function(id) {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;

        if (this.items[id].qty <= 0) {
            delete this.items[id];
        }
    };

    /**remove cart's total qty & total price by item's aggregate qty &
     * aggregate price
     */
    this.removeItem = function(id) {
        this.totalQty -= this.items[id].qty; 
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };

    /**Create function that returns an array */
    this.generateArray = function() {
        var arr = [];
        //loop through keys in item array
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};