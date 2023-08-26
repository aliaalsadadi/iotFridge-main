const axios = require('axios');
const fs = require('fs');

function getHighestNumberedFile(directoryPath) {
    try {
        const files = fs.readdirSync(directoryPath);

        if (files.length === 0) {
            return 0;
        }

        let highestNumber = -Infinity;

        for (const file of files) {
            const numberMatch = file.match(/(\d+)/);
            if (numberMatch) {
                const number = parseInt(numberMatch[0], 10);
                if (number > highestNumber) {
                    highestNumber = number;
                }
            }
        }

        return highestNumber;
    } catch (error) {
        console.error('Error reading directory:', error);
        return -Infinity; // Error reading directory
    }
}

async function get_image(image_name, folder) {
    try {
        let url = 'https://f326-193-188-123-42.ngrok-free.app/capture';
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        fs.writeFileSync(`images/${folder}/${image_name}.jpg`, Buffer.from(response.data, 'binary'));
    } catch (error) {
        console.error(`Error getting image ${image_name}:`, error);
    }
}

async function processImages(folder, highestNumber) {
    let i = highestNumber + 1;

    if (i === 0) {
        i = 1; // No files in the directory, start from 1
    }

    const totalIterations = i + 10; // Take another 10 pictures from the next number onwards

    for (let j = i; j <= totalIterations; j++) {
        await get_image(j.toString(), folder);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

async function get_images() {
    const highesttrain = getHighestNumberedFile("images/train/");
    const highestval = getHighestNumberedFile("images/val/");

    await processImages('train', highesttrain);
    await new Promise(resolve => setTimeout(resolve, 3000));
    await processImages('val', highestval);
}

exports.get_images = get_images;