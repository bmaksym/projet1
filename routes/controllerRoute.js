const axios = require("axios");
const SkiApi = "https://ski-api.herokuapp.com";

const PATCH = false;

let dummy_friendship = [
    {
        "id":"6221692368a0c30004062a7f",
        "friends": [
            {
                "id": "62373cf5fa42fd0004175d77",
                "name": "William Garneau",   
            },
            {
                "id": "623c85d64c689600040f61c9",
                "name": "Marie-Christine Desjardins"
            },
            {
                "id": "6268ae6a72f5730004f1ecc3",
                "name": "Christopher"
            }                
        ]
    },
    {
        "id":"62373cf5fa42fd0004175d77",
        "friends": [
            {
                "id":"6221692368a0c30004062a7f",
                "name":"Amy Bienvenu"    
            }                
        ]
    },
    {
        "id": "623c85d64c689600040f61c9",
        "friends": [
            {
                "id": "6268ae6a72f5730004f1ecc3",
                "name": "Christopher"
            }
        ]
    },
    {
        "id": "6268ae6a72f5730004f1ecc3",
        "friends": [
            {
                "id":"6221692368a0c30004062a7f",
                "name":"Amy Bienvenu"    
            }
        ]
    }
];

function friends(id){
    let dummy_user = {id:id,friends:[]};
    let friends = (dummy_friendship.find(user => {return user.id===id;}) || {id:id,friends:[]}).friends;
    return friends;
}

function friends_add(ownerID, friendID, friendName) {
    let elementIndex = dummy_friendship.findIndex((obj => obj.id == ownerID));
    let friend = {id : friendID, name : friendName};
    if (dummy_friendship[elementIndex].friends.findIndex(obj => obj.id == friendID)<0) {
        dummy_friendship[elementIndex].friends.unshift(friend);
    }
}

function friends_remove(ownerID, friendID) {
    let user = dummy_friendship.find(user => {return user.id===ownerID;}) || {id:ownerID,friends:[]};
    user.friends.filter((friend) => friend.id!=friendID);
    dummy_friendship = dummy_friendship.map(
        user => user.id == ownerID ? {
            ...user,friends:user.friends.filter((friend) => friend.id!=friendID)
        } : user);
}

module.exports = {

    pageSpotsList : (req, res) => {
        res.render('spots_list');
    },

    pageSignup : (req, res) => {
        res.render('signup');
    },

    pageProfil : (req, res) => {
        res.render('profil');
    },

    pageProfilUsager : (req, res) => {
        res.render('profile-user');
    },

    pageCreateSpot : (req, res) => {
        res.render('spot_creation');
    },

    pageInformation : (req, res) => {
        res.render('spot_information');
    },

    pageUpdate : (req, res) => {
        res.render('spot_update');
    },

    getLogout : (req, res) => {
        res.app.locals.apiKey = "";
        res.redirect("/");
    },

    postSignup : (req, res) => {
        let infoSignup = req.body;
    
        axios.post(SkiApi + "/signup", infoSignup )
        .then( () => res.redirect("/"))
    
        .catch(erreur => {
            req.flash("error", `Ce compte existe déjà`);
            res.redirect("/users/signup");
        });
    },

    postLogin : (req, res) => {
        let infoLogin = req.body;
    
        axios.post(SkiApi + "/login", infoLogin)
            .then(resultat => {
                res.app.locals.apiKey = resultat.data.token;
                res.redirect('/');
            })
            .catch(() => {
                req.flash("error", `Mauvais Mot de Passe ou Email`);
                res.redirect('/');
            });
    },

    getProfil : (req, res, next) => {
        let token = res.app.locals.apiKey;  

        axios.get(SkiApi + "/tokenInfo", {headers: {"Authorization": token}})
        .then(resultat => {
            // PATCH pour avoir des amis à tester
            if (PATCH) {
                resultat.data.friends = friends(resultat.data._id);
            }
            // Fin PATCH
            res.app.locals.infoProfil = resultat.data;
            next();
        })
        .catch(() => {res.redirect("/");});
    },

    getSpots : (req, res, next) => {
        let token = res.app.locals.apiKey;  
        let page = req.params.page;
        if (page==undefined) page=1;
    
        axios.get(SkiApi + `/ski-spot?limit=6&page=${page}`, {headers: {"Authorization": token}})
            .then(resultat => {
                res.locals.spots = resultat.data.skiSpots;
                res.locals.totalPages = resultat.data.totalPages;
                res.locals.page = page;
                next();

            }).catch(() => {
                res.render("login");
            });
    },
    postCreateSpot : (req, res) => {
        let token = res.app.locals.apiKey;
        let infoCreate = req.body;
    
        let coordinates =  req.body.coordinates;
        let tabCoordinates = coordinates.split(",");
        let numberTabCoordinates = tabCoordinates.map( i => Number(i));
    
        axios.post(SkiApi + "/ski-spot", {
                ...infoCreate,
                "coordinates": numberTabCoordinates
            }, 
            {headers: {"Authorization": token}})
    
            .then(() => res.redirect('/'))
            .catch(() => {
                req.flash("error", `Impossible de créer le spot`);
                res.redirect("/spots/create");
            });
    },
    getSpotInformation : (req, res, next) => {
        let token = res.app.locals.apiKey;
        let id = req.params.id;
    
        axios.get(SkiApi + "/ski-spot/" + id, {headers: {"Authorization": token}})
            .then(resultat => {
                res.app.locals.info = resultat.data.skiSpot;
                next();
            })
            .catch(() => {res.redirect("/");});
    },
    postUpdateSpot : (req, res) => {
        let token = res.app.locals.apiKey;
        let id = req.params.id;
    
        let infoUpdate = req.body;
        let coordinates = req.body.coordinates;
        let tabCoordinates = coordinates.split(",");
        let numberTabCoordinates = tabCoordinates.map( i => Number(i));
    
        let info = {
            ...infoUpdate,
            "coordinates": numberTabCoordinates
        };
        axios.put(SkiApi + "/ski-spot/" + id, info, { headers: {"Authorization": token} })
        .then(() => {res.redirect("/"); })
        .catch(() => {
            req.flash("error", `Une Erreur c'est produite lors de la modification du spot `);
            res.redirect("/spots/update/" + id);
            });
    },
    deleteSpot : (req, res) => {
        let token = res.app.locals.apiKey;
        let id = req.params.id;
    
        axios.delete(SkiApi + "/ski-spot/" + id, {headers: {"Authorization": token} })
            .then(() => res.redirect("/"))
            
            .catch(() => {
            req.flash("error", `Le Spot n'a pu être supprimé `);
            res.redirect("/");
            });
    },
/***********************************3eme livraison**************************************/
    getUser : (req, res, next) => {
            let token = res.app.locals.apiKey;  
            let id = req.params.id;

            if (id==undefined || id == 0) {
                res.redirect("/");
            } else
            if (res.app.locals.infoProfil && res.app.locals.infoProfil._id==id) {
                res.redirect("/users/profil");
            } else
            {
                axios.get(SkiApi + "/user/"+id, {headers: {"Authorization": token}})

                .then(resultat => {
                // PATCH pour avoir des amis à tester
                if (PATCH) {
                    resultat.data.user.friends = friends(resultat.data.user._id);
                }
                // Fin PATCH
                res.app.locals.infoUser = resultat.data.user;

                next();
                })
                .catch(() => {});
            }

    },
    deleteFriend : (req, res) => {
        let token = res.app.locals.apiKey;
        let id = req.params.id;

        // PATCH pour avoir des amis à tester
        if (PATCH) {
            friends_remove(res.app.locals.infoProfil._id, id);
        }
        // Fin PATCH        

        axios.delete(SkiApi + "/friend/" + id, {headers: {"Authorization": token} })

        .then(() => res.redirect("/users/profil"))
        .catch(() => {

            req.flash("error", `L'ami n'a pu être supprimé `);
            res.redirect("/users/profil");
         });
    },
    postFriend : (req, res) => {
        let token = res.app.locals.apiKey;
        let id = req.body.friendId;
        let name = req.body.name;
        let messageAjoute = `${name} a été ajouté a votre liste d'amis`
        let info = {"friendId":id};

        // PATCH pour avoir des amis à tester
        if (PATCH) {
            friends_add(res.app.locals.infoProfil._id, req.body.friendId, req.body.name);
        }
        // Fin PATCH

        axios.post(SkiApi + "/friend/",info, {headers: {"Authorization": token}})

        .then(resultat => {
            req.flash("success",messageAjoute);
            res.redirect("/users/profil");
            })
        .catch(() => {
            req.flash("error", `Impossible d'ajouter cet ami`);
            res.redirect("/users/"+id);});
    },
    getSearch : (req, res) => {
        let token = res.app.locals.apiKey;
        let words = req.query.words;

        if (words == undefined || words == 0) {
            res.render('search_form');
        }
        else {
            axios.get(SkiApi + "/users/search/"+words, {headers: {"Authorization": token}})
            .then(resultat => {
                res.locals.users = resultat.data.users.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                  });  
                res.render('search_results');
            })
            .catch(()=> {res.redirect("/");});
        }
    },
    getMyFriends : (req, res, next) => {
        let token = res.app.locals.apiKey;  
        axios.get(SkiApi + "/friend", {headers: {"Authorization": token}})
        .then(resultat => {
            res.app.locals.infoProfil.friends = resultat.data.friends;
            next();
        })
        .catch(() => {res.redirect("/");});
    },    
    error404 : (req, res) => {
        res.render("error404");
    },
};
