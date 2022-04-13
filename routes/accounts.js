var express = require("express");
var router = express.Router();
const middl = require("../middleware/auth");
const Users=require('../models/users');
const Accounts=require('../models/accounts');
const Transactions=require('../models/transactions');

//show all users
router.get("/user", middl.isLoggedIn, (req, res) => {
    Accounts.find({
        members: req.user._id
    }, (err, foundAll) => {
        if (err) {
            console.log(err);
        } else {
            res.render("../views/user", {
                accounts: foundAll,
                currentUser: req.user
            });
        }
    })

})

//Adding new Account
router.get('/newaccount',(req,res)=>{
        Users.find({}, (err, foundAll) => {
            if (err) {
                console.log(err);
                return res.redirect("/user");
            }
            console.log("req.user==",req.user);
            // console.log(foundAllUser);
    
            res.render("../views/accounts/newaccount", {
                users: foundAll,
                currentUser: req.user
            });
        })
})
router.post("/newaccount", (req, res) => {
    var accountname = req.body.accountname;
    var description = req.body.description;
    var members = req.body.members;
    var transactions = [];
    var newAccount = {
        accountname:accountname,
        description:description ,
        members: members,
        transactions: transactions
    };
    Accounts.create(newAccount, function (err, Results) {
        if (err) {
            console.log(err);
            return res.redirect("/newaccounts");
        }
        Results.members.push(req.user._id);
        Results.save();
        console.log("success", "Account Created Successfully");
        res.redirect("/user");
    })
})
//Edit account
router.get("/user/:accountid/editaccount",middl.isLoggedIn, (req, res) => {
    Accounts.findById(req.params.accountid, (err, foundAccount) => {
        if (err) {
            console.log(err);
            return res.redirect("/user");
        }
        res.render("../views/accounts/editaccount", {
            accountId: req.params.accountid,
            account: foundAccount
        });
    })
})

// UPDATING THE ACCOUNT DATA AFTER EDITING

router.post("/user/:accountid", middl.isLoggedIn,(req, res) => {
    Accounts.findByIdAndUpdate(req.params.accountid, req.body.account, (err, updatedAccount) => {
        if (err) {
            console.log(err);
            return res.redirect("/user");
        }
        console.log("success", "Account Updated SuccessFully");
        res.redirect("/user");
    })
})

//Delete account

router.get("/user/:accountid/deleteaccount", middl.isLoggedIn, function (req, res) {
    Accounts.findByIdAndRemove(req.params.accountid, (err) => {
        if (err) {
            console.log(err);
            return res.redirect("/user");
        }
        Transactions.remove({
            account: req.params.accountid
        }, (err) => {
            if (err) {
                console.log(err);
                return res.redirect("/user");
            }
        });
        console.log("success", "Account Deleted Successfully");
        res.redirect("/user");
    })
})


//Acount Details
router.get("/user/:accountid", (req, res) => {
    var income = 0;
    var expense = 0;
    var transfer = 0;
    Accounts.findById(req.params.accountid).populate("members").exec((err, foundAccount) => {
        if (err) {
            console.log(err);
            return res.redirect("/user");
        }
        console.log(foundAccount);
        Transactions.find({
            account: req.params.accountid
        }, (err, FoundAll) => {
            FoundAll.forEach(function (transaction) {
                if (err) {
                    console.log(err);
                    return res.redirect("/user");
                }
                if (transaction.type === "income") {
                    income = income + transaction.amount;
                } else if (transaction.type === "expense") {
                    expense = expense + transaction.amount;
                } else {
                    transfer = transfer + transaction.amount;
                }

            })
            res.render("../views/accounts/accountdetails", {
                account: foundAccount,
                income: income,
                expense: expense,
                transfer: transfer
            });
        })
    })
})

//Addmember

router.get("/user/:accountid/addmember", (req, res) => {
    Accounts.findById(req.params.accountid).populate("members").exec((err, foundAccount) => {
        if (err) {
            console.log(err);
            return res.redirect("/user");
        }
        Users.find({}, (err, allUser) => {
            if (err) {
                console.log(err);
                return res.redirect("/user");
            }
            for (var i = allUser.length - 1; i >= 0; i--) {
                for (var j = 0; j < foundAccount.members.length; j++) {
                    if (allUser[i] && (allUser[i].email === foundAccount.members[j].email)) {
                        allUser.splice(i, 1);
                    }
                }
            }
            //   console.log(JSON.stringify(allUser));
            res.render("../views/accounts/addmember", {
                account: foundAccount,
                users: allUser
            });
        })
    })
})
router.post("/user/:accountid/addmember", (req, res) => {
    Accounts.findById(req.params.accountid, (err, foundOne) => {
        if (err) {
            console.log(err);
            return res.redirect("/user/" + req.params.accountid);
        }
        foundOne.members.push(req.body.members);
        foundOne.save();
        res.redirect("/user/" + req.params.accountid);
    })
})

module.exports=router;