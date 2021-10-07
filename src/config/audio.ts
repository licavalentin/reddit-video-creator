import { getArgument } from "../utils/helper";
import { getVoices } from "../audio/index";

export const voice = async (): Promise<string> => {
  const voiceName = getArgument("VOICE");

  if (voiceName) {
    return voiceName;
  }

  return await getVoices()[0];
};
