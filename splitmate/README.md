# SplitMate

SplitMate is a simple React Native app built with Expo for splitting restaurant bills with friends. Upload a receipt image, assign dishes to friends, and see what everyone owes. The app also works on the web through Expo's web support.

## Getting Started
1. Install [Expo CLI](https://docs.expo.dev/get-started/installation/) if you don't have it:
```
npm install -g expo-cli
```
2. Install dependencies:
```
cd splitmate
npm install
```
3. Run the app in Expo (native or web):
```
expo start
```
The Expo dashboard will let you run the app on an emulator or a mobile device using the Expo Go client.
Select the **Web** option in the dashboard to launch it in the browser.

## Features
- Upload a photo of a receipt.
- OCR processing with `tesseract.js` to detect item names and prices.
- Edit parsed items if the OCR is incorrect.
- Add friends and assign them to receipt items.
- Automatic calculation of each person's share with adjustable tip amount and detected tax.

This app is a lightweight demo and can be extended with more features like syncing with payment services or exporting results.
