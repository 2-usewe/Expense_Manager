const express=require('express');
const router=express.Router();
var Accounts = require("../models/accounts");
var Transactions = require("../models/transactions");
const middl = require("../middleware/auth");

router.get("/user/:accountid/alltransaction", middl.isLoggedIn, function (req, res) {
    var accountId = req.params.accountid;
    Accounts.findById(accountId, (err, foundAccount) => {
        if (err) {
            console.log(err);
            return redirect("/user");
        }
        Transactions.find({
            account: accountId
        }).sort({
            date: -1
        }).populate("user").exec(function (err, foundTransactions) {
            console.log(foundTransactions);
            if (err) {
                console.log(err);
                return res.redirect("/user");
            }
            res.render("../views/transactions/alltransaction", {
                account: foundAccount,
                currentUser: req.user,
                transactions: foundTransactions
            });
        })

    })
})
//Add new Transaction
router.get("/user/:accountid/transactions/newtransaction", middl.isLoggedIn, (req, res) => {
    Accounts.findById(req.params.accountid).populate("members").exec((err, foundOne) => {
        if (err) {
            console.log(err);
            return res.redirect("/user/" + req.params.accountid + "/transactions/newtransaction");
        }
        res.render("../views/transactions/newtransaction", {
            accountId: foundOne._id,
            account: foundOne,
            currentUser: req.user
        });
    })
})
router.post("/user/:accountid/alltransaction", middl.isLoggedIn, (req, res) => {
    var accountId = req.params.accountid;
    var amount = req.body.amount;
    var type = req.body.type;
    var desc = req.body.description;
    var toUser = req.body.to;
    console.log(toUser, type, amount, desc);
    /// finding Account

    Accounts.findById(accountId, function (err, foundAccount) {
        if (err) {
            console.log(err);
            
            return res.redirect("/user/" + accountId + "/transactions/newtransaction");
        }
        //// checking if type is "transfer" if type===transfer (then it will submit 2 transactions [one "income" to the selected user] and [one "expense for the current loggedin user"])
        if (type === "transfer") {
            var type1 = "expense";
            var newTransaction1 = {
                type: type1,
                account: foundAccount,
                user: req.user.id,
                amount: amount,
                description: desc
            };
            //console.log('newTransaction1', newTransaction1);
            Transactions.create(newTransaction1, function (err, createdtransaction) {
                if (err) {
                    console.log('newTransaction1', err);
                    return res.redirect("/user/" + accountId + "/transactions/newtransaction");
                }
                foundAccount.transactions.push(createdtransaction);
                foundAccount.save();
                var type2 = "income";
                var newTransaction2 = {
                    type: type2,
                    account: foundAccount,
                    user: toUser,
                    amount: amount,
                    description: desc
                };
                // console.log('newTransaction2', newTransaction2);
                Transactions.create(newTransaction2, (err, createdOne) => {
                    if (err) {
                        console.log('newTransaction2', err);
                        return res.redirect("/user/" + accountId + "/alltransaction");
                    }
                    foundAccount.transactions.push(createdOne);
                    foundAccount.save();
                    res.redirect("/user/" + accountId + "/alltransaction");
                })
            })
        } else {
            var newTransaction = {
                type: type,
                account: foundAccount,
                user: req.user,
                amount: amount,
                description: desc
            }
            Transactions.create(newTransaction, function (err, createdtransaction) {
                if (err) {
                    console.log(err);
                    return res.redirect("/user/" + accountId + "/transactions/newtransaction");
                }
                foundAccount.transactions.push(createdtransaction);
                foundAccount.save();
                res.redirect("/user/" + accountId + "/alltransaction");
            })
        }

    })
})
//Adding transaction
router.get("/addtransaction", middl.isLoggedIn, (req, res) => {
    Accounts.find({
        members: req.user._id
    }, (err, foundAll) => {
        if (err) {
            console.log(err);
            return res.redirect("/addtransaction");
        }
        res.render("../views/transactions/addtransaction", {
            accounts: foundAll
        })
    })
});
router.post("/alltransaction", (req, res) => {
    var accountId = req.body.accountid;
    var amount = req.body.amount;
    var type = req.body.type;
    var desc = req.body.description;
    var newTransaction = {
        type: type,
        account: accountId,
        user: req.user,
        amount: amount,
        description: desc
    };
    Transactions.create(newTransaction, function (err, createdtransaction) {
        if (err) {
            console.log(err);
            return res.redirect("/user/" + accountId + "/transactions/newtransaction");
        }
        Accounts.findById({
            accountId
        }, (err, foundAccount) => {
            if (err) {
                console.log(err);
                return res.redirect("/user");
            }
            foundAccount.transactions.push(createdtransaction);
            foundAccount.save();
            res.redirect("/user/" + foundAccount._id + "/alltransaction");
        })

    })

})
//Edit transaction
router.get("/user/:accountid/alltransactions/:transactionid/edittransaction", middl.isLoggedIn, (req, res) => {
    Transactions.findById(req.params.transactionid, (err, foundTransaction) => {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong!! Try later");
            return res.redirect("/user/" + req.params.accountid + "/alltransaction");
        }
        res.render("../views/transactions/edittransaction", {
            transaction: foundTransaction,
            accountId: req.params.accountid
        });
    })
})
router.post("/user/:accountid/alltransactions/:transactionid", (req, res) => {
    Transactions.findByIdAndUpdate(req.params.transactionid, req.body.transaction, (err, updatedtransaction) => {
        if (err) {
            console.log(err);
            
            return res.redirect("/user/" + req.params.accountid + "/alltransaction");
        }
        res.redirect("/user/" + req.params.accountid + "/alltransaction");
    })
})
//Delete Transactions
router.get("/user/:accountid/alltransactions/:transactionid", middl.isLoggedIn, (req, res) => {
    var accountId = req.params.accountid;
    var transactionId = req.params.transactionid;
    console.log(accountId, transactionId);
    Accounts.findById(req.params.accountid, (err, foundOne) => {
        if (err) {
            console.log(err);
            return res.redirect("/user/" + req.params.accountid + "/alltransaction");
        }
        foundOne.transactions.remove(transactionId);
        foundOne.save();
        Transactions.findByIdAndRemove(req.params.transactionid, (err) => {
            if (err) {
                console.log(err);
                return res.redirect("/user/" + req.params.accountid + "/alltransaction");
            }
            console.log("success", "Transaction deleted Successfully");
            res.redirect("/user/" + req.params.accountid + "/alltransaction");
        })

    })

})

module.exports=router;