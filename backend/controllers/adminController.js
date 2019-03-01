const db = require('./dbController')
const Kri = require(__dirname + "/Kriterii.json")

module.exports.setUser = async function(req,res){
  db.ChangeRole(req.body.Id,false)
}

module.exports.setAdmin = async function(req,res){
  db.ChangeRole(req.body.Id,true)
}

module.exports.getAdmins = async function (req,res){
  let users = []
  let Users = await db.allUsers()
  for (let user of Users) {
    let str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic
    users.push({ Name: str, Role: user.Role, Id: user.id })
  }
  res.status(200).send({ Users: users })
}

module.exports.dynamic = async function (req, res) {
  let info = []
  let Users = await db.allUsers()
  for (let user of Users) {
    if (!user) continue;
    let str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic
    let Achievements = []
    let AchTexts = []
    let AchId = []
      let Statuses = []
      let Chars = []
      let Comments = []
    for (let achievement of user.Achievement) {

      let ach = await db.findAchieveById(achievement)
        if (!ach) continue;
        Achievements.push(ach.crit)
        AchId.push(ach._id)
        AchTexts.push(ach.achievement)
        Statuses.push(ach.status)
        Comments.push(ach.comment)
        chars = ""
        i = 0;
        for (ch of ach.chars) {
          if (i!=0) chars += ', '
          chars += ch
          i++
        }
        Chars.push(chars)
    }
    if( AchId.length > 0){
      info.push({ Id: user._id, user: str, IsInRating:user.IsInRating, AchTexts: AchTexts, Achievements: Achievements, AchId: AchId, Statuses: Statuses, Chars: Chars, Comments:Comments })
    }
  }
  res.status(200).send({ Info: info })
}

module.exports.AchSuccess = async function (req, res) {
  await db.ChangeAchieve(req.body.Id, true)
    if (req.user._json.email)
        id = req.user._json.email
    else id = req.user.user_id
  balls(id)
}

module.exports.AchFailed = async function (req, res) {
  await db.ChangeAchieve(req.body.Id, false)
}

module.exports.AddToRating = async function (req, res) {
    await db.AddToRating(req.body.Id)
}

module.exports.Comment = async function(req,res){
  await db.comment(req.body.Id, req.body.comment)
}

module.exports.Checked = async function (req, res) {
  let info = []
  let Users = await db.allUsers()
  for (let user of Users) {
    let str = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic
    let Achievements = []
    let AchTexts = []
    let AchId = []
    let Status = []
    let Ball = []
    let Comment = []
    for (let achievement of user.Achievement) {
      let ach = await db.findAchieveById(achievement)
      if (ach && ach.status !== 'Ожидает проверки') {
        Achievements.push(ach.crit)
        AchId.push(ach._id)
        AchTexts.push(ach.achievement)
        Status.push(ach.status)
        Ball.push(ach.ball)
        Comment.push(ach.comment)
      }
    }
    if( AchId.length > 0){
      info.push({ Id: user._id, user: str, AchTexts: AchTexts, Achievements: Achievements, AchId: AchId, Status: Status, Ball: Ball, Comment: Comment })
    }
  }
  res.status(200).send({ Info: info })
}

module.exports.allUsers = async function (req, res) {
  let ip = await req.url.slice(6)
  let User = await db.findUser(ip)
  let Achs = []
  for (let i of User.Achievement) {
    let Ach = await db.findAchieveById(i)
    let files = Ach.files
    let date = Ach.date
    let crit = Ach.crit
    let popisal = Ach.comment
    let status = Ach.status
    let Achieve = {
      Files: files,
      Date: date,
      Crit: crit,
      Popisal: popisal,
      Status: status
    }
    Achs.push(Achieve)
  }
  res.status(200).send({ LastName: User.LastName, FirstName: User.FirstName, Achs: Achs })
}

module.exports.getRating = async function (req, res) {
  let kri = JSON.parse(JSON.stringify(Kri))



  let users = []
  let Users = await db.allUsers()
  for (let user of Users) {
      let crits = {}
      for (key of Object.keys(kri)) {
          crits[key] = 0;
      }
    Achs = user.Achievement;
    for(let achID of Achs) {
        ach = await db.findAchieveById(achID);
        if (!ach) continue
        if (ach.ball) crits[ach.crit] += ach.ball;
    }
    let fio = user.LastName + ' ' + user.FirstName + ' ' + user.Patronymic
    users.push({ Name: fio, Type: user.Type, Course: user.Course, Crits: crits, Ball: user.Ball })
  }
  res.status(200).send({ Users: users })
}

const balls = async function (id) {
  let kri = JSON.parse(JSON.stringify(Kri))

  let balls = 0;
  let Achs = await db.UserSuccesAchs(id)
  let kriteries = {};

  for (key of Object.keys(kri)) {
    kriteries[key] = []
  }


  for(let achID of Achs) {
      ach = await db.findAchieveById(achID);
      let curKrit = kri[ach.crit];
      if (Array.isArray(curKrit)) {
          kriteries[ach.crit].push({'ach': ach, 'balls':curKrit})
      }
      else {
          for (let ch of ach.chars) {
              curKrit = curKrit[ch]
          }
          kriteries[ach.crit].push({'ach': ach, 'balls':curKrit})
      }
  }

    for (key of Object.keys(kri)) {
        balls += MatrBalls(kriteries[key])
        for (curAch of kriteries[key]) {
          db.updateAchieve(curAch['ach']._id, curAch['ach'])
        }
    }

  db.setBalls(id,balls)
}

const MatrBalls = function(M){
  let S = 0;
  let max = 0;
  for(let i = 0; i < M.length; i++){
      for(let j=0; j < M.length; j++){
        if(M[j]['balls'][i] > max){
          max = M[j]['balls'][i];
          var q = j
        }
      }
      M[q]['ach'].ball = max;
      M[q]['balls'] = [0,0,0,0,0,0];
      S+=max;
      max = 0
  }
  return S
}
