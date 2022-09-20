import getAuthenticatedUser from '../../../server/helpers/auth/token';
import dbConnect from '../../../server/lib/dbConnect';
import CharacterModel from '../../../server/models/Character';

export default async function handler(req, res) {
    await dbConnect();
    const {
        method,
        query: { id },
    } = req;

    const session = await getAuthenticatedUser(req);

    switch (method) {
        case 'GET':
            try {
                const character = await CharacterModel.findById(id);
                return res.json(character);
            } catch (error) {
                return res
                    .status(404)
                    .json({ errorMessage: 'No character with such id' });
            }

        case 'PUT':
            try {
                const updatedFields = req.body;
                const updatedCharacter = await CharacterModel.findByIdAndUpdate(
                    id,
                    updatedFields,
                    { new: true, runValidators: true }
                );
                return res.json(updatedCharacter);
            } catch (error) {
                return res.status(404).json({ errorMessage: error.message });
            }

        case 'DELETE':
            try {
                console.log(session);
                if (!session) {
                    return res
                        .status(401)
                        .json({ errorsMessage: 'Unauthorized' });
                }

                const character = await CharacterModel.findById(id);

                if (!character) {
                    return res.status(404).send('No character with such id');
                }

                const idOfAuthor = character.author.valueOf();

                if (session.user._id !== idOfAuthor) {
                    return res.status(403).send("You can't do that");
                }

                await CharacterModel.deleteOne(character);
                return res.status(200).send('deleted');
            } catch (error) {
                return res.status(404).json({ errorMessage: error.message });
            }

        default:
            res.status(405).json({
                errorMessage: `No such method for this url: ${req.url}.`,
            });
            break;
    }
}
