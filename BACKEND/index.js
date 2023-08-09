const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const API_URL = "http://20.244.56.144/train/trains";
const accessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTE1NjAzMDcsImNvbXBhbnlOYW1lIjoiQmhzayBUcmFpbnMiLCJjbGllbnRJRCI6IjI4OGIyN2EzLTViZGUtNDcxNi05MWQyLTNkZThmMWQ3MmYyNSIsIm93bmVyTmFtZSI6IiIsIm93bmVyRW1haWwiOiIiLCJyb2xsTm8iOiIyMDRHMUEzMzA1In0.BuqKXFdqP2IOCIOnesdOTKJhnwki-7n7oGMDFibchu4";
const filterTrains = (train) => {
  const currentDate = new Date();
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();
  const currentSeconds = currentDate.getSeconds();
  const departureTime =
    train.departureTime.Hours * 60 +
    train.departureTime.Minutes +
    train.departureTime.Seconds / 60 +
    train.delayedBy;
  const currentTime = currentHours * 60 + currentMinutes + currentSeconds / 60;
  return departureTime > currentTime + 30;
};

const sortTrains = (trainOne, trainTwo) => {
  const firstTrainPrice = trainOne.price.AC + trainOne.price.sleeper;
  const secondTrainPrice = trainTwo.price.AC + trainTwo.price.sleeper;

  if (firstTrainPrice < secondTrainPrice) return -1;
  if (firstTrainPrice > secondTrainPrice) return 1;

  const firstTrainSeatsAvail =
    trainOne.seatsAvailable.AC + trainOne.seatsAvailable.sleeper;
  const secondTrainSeatsAvail =
    trainTwo.seatsAvailable.AC + trainTwo.seatsAvailable.sleeper;

  if (firstTrainSeatsAvail > secondTrainSeatsAvail) return -1;
  else if (firstTrainSeatsAvail < secondTrainSeatsAvail) return 1;

  const firstTrainDepartureTime =
    trainOne.departureTime.Hours * 60 +
    trainOne.departureTime.Minutes +
    trainOne.departureTime.Seconds / 60 +
    trainOne.delayedBy;
  const secondTrainDepartureTime =
    trainTwo.departureTime.Hours * 60 +
    trainTwo.departureTime.Minutes +
    trainTwo.departureTime.Seconds / 60 +
    trainTwo.delayedBy;

  return secondTrainDepartureTime - firstTrainDepartureTime;
};

app.post("/trains", async (req, res) => {
  try {
    const trains = await axios.get(API_URL, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    const filteredTrains = trains.data.filter(filterTrains).sort(sortTrains);
    res.json(filteredTrains);
  } catch (error) {
    res.status(500).json({ error: "Internalerror" });
  }
});

app.get("/", (req, res) => {
  res.send("my train api");
});

app.listen(8000, () => {
  console.log("Its running on port 8000");
});
