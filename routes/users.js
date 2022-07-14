const express = require("express");
const router = express.Router();
const controllerRoute = require('./controllerRoute');

router.get("/:page", controllerRoute.getSpots,controllerRoute.getProfil,controllerRoute.pageSpotsList);
router.get("/", controllerRoute.getSpots,controllerRoute.getProfil,controllerRoute.getMyFriends,controllerRoute.pageSpotsList);

router.get("/spots/create", controllerRoute.pageCreateSpot);
router.post("/spots/create", controllerRoute.postCreateSpot);
router.get("/spots/update/:id",controllerRoute.getSpotInformation,controllerRoute.getProfil, controllerRoute.pageUpdate);
router.put("/spots/update/:id", controllerRoute.postUpdateSpot);
router.delete("/spots/delete/:id", controllerRoute.deleteSpot);
router.get('/spots/:id', controllerRoute.getSpotInformation, controllerRoute.pageInformation);

router.get("/users/logout", controllerRoute.getLogout);
router.get('/users/signup', controllerRoute.pageSignup);
router.post("/users/signup", controllerRoute.postSignup);
router.post("/users/login", controllerRoute.postLogin);
router.get('/users/profil', controllerRoute.getProfil, controllerRoute.getMyFriends, controllerRoute.pageProfil);
router.get("/users/search",controllerRoute.getSearch);
router.post("/users/add", controllerRoute.postFriend);
router.delete("/users/delete/:id",controllerRoute.deleteFriend);
router.get('/users/:id', controllerRoute.getUser,controllerRoute.pageProfilUsager);

router.get("*", controllerRoute.error404);

module.exports = router;