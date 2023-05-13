import {
  Button,
  Center,
  Container,
  HStack,
  Heading,
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Spinner,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Downloader from "./components/Downloader";
import { apiRequest, baseURL, youTubeBaseUrl } from "./utils/axios";
import axios from "axios";
import { FiDownload } from "react-icons/fi";
import Loader from "./components/loader/Loader";
import { shell } from "electron";

const App = () => {
  const YOUTUBE_API_KEY: string = "AIzaSyBA4OQ9i11REqdtOOMYiHkiA3UdQMB0AsE";
  const [url, setUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoThumb, setVideoThumb] = useState<string>("");
  const [quality, setQuality] = useState<string>("");
  const toast = useToast();

  const handleSubmit = async () => {
    const videoUrl = url.trim();
    if (!videoUrl || videoUrl === "")
      return toast({
        title: "Please input video url",
        position: "bottom",
        status: "error",
        isClosable: true,
      });

    const videoIdMatch = videoUrl.match(/(?:v=)([\w-]+)/);
    if (!videoIdMatch)
      return toast({
        title: "Video id not found!",
        position: "bottom",
        status: "error",
        isClosable: true,
      });
    setVideoId(videoIdMatch[1]);

    setLoading(true);
    try {
      const { data } = await axios.get(
        `${youTubeBaseUrl}/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet`
      );

      const sninnet = data?.items[0]?.snippet;
      if (sninnet) {
        setVideoTitle(sninnet?.title);
        setVideoThumb(sninnet?.thumbnails?.default?.url);
        toast({
          title: "Video got it",
          position: "bottom",
          status: "success",
          isClosable: true,
        });
      }
    } catch (error: any) {
      if (!error?.response)
        return toast({
          title: "Something went worng!",
          position: "bottom",
          status: "error",
          isClosable: true,
        });
      const message = error?.response?.data?.message;
      toast({
        title: message,
        position: "bottom",
        status: "success",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      const { data } = await axios.post(`${baseURL}/api/download`, {
        url: videoUrl,
        quality,
      });
      shell.openExternal(data?.download);
      // window.open(data?.download, "_blank");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container
      w="350px"
      overflowX="hidden"
      overflowY="hidden"
      h="420px"
      mx="auto"
      p={4}
      position="relative"
    >
      <Center>
        <Image w="16" alt="logo" src="icon.png" />
      </Center>
      <Heading textAlign="center" fontWeight="semibold" fontSize="lg" mt={2}>
        YouTube Video Downloader
      </Heading>
      <Text fontSize="xs" fontWeight="light" textAlign="center" mb={3}>
        Awesome youtube video downloader
        <br /> google chrome extension
      </Text>
      <VStack>
        <InputGroup
          w="full"
          py={"1px"}
          border="2px"
          borderColor="orange.100"
          rounded="md"
        >
          <Input
            pr={24}
            pl={2}
            py={2}
            variant="unstyled"
            onChange={(e: any) => setUrl(e.target.value)}
            type="text"
            placeholder="Video url"
            fontSize="md"
          />
          <InputRightElement h="full" w="28" p={1}>
            <Button
              onClick={handleSubmit}
              colorScheme="orange"
              fontSize="xs"
              fontWeight="semibold"
              w="full"
              h="full"
            >
              Search
            </Button>
          </InputRightElement>
        </InputGroup>
      </VStack>

      {loading ? (
        <Loader />
      ) : videoTitle && videoThumb ? (
        <>
          <Downloader thumbnail={videoThumb} title={videoTitle} />
          <>
            <HStack spacing={2}>
              <Select
                w="60%"
                onChange={(e) => setQuality(e.target.value)}
                placeholder="Select quality"
              >
                <option value="highest">Highest</option>
                <option value="highestaudio">Highest Audio</option>
                <option value="highestvideo">Highest Video</option>
                <option value="lowest">Lowest</option>
                <option value="lowestaudio">Lowest Audio</option>
                <option value="lowestvideo">Lowest Video</option>
              </Select>
              <Button
                w="40%"
                onClick={handleDownload}
                colorScheme="messenger"
                rightIcon={<Icon as={FiDownload} />}
              >
                {loading ? <Spinner /> : "Download"}
              </Button>
            </HStack>
          </>
        </>
      ) : null}
      <HStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        w="full"
        textAlign="center"
        fontWeight="semibold"
        mt={3}
        justify="center"
      >
        <Text>Created by </Text>
        <Text
          cursor="pointer"
          color="green"
          textDecor="underline"
          onClick={() =>
            shell.openExternal("https://www.showwcase.com/devlopersabbir")
          }
        >
          @devlopersabbir
        </Text>
      </HStack>
    </Container>
  );
};
export default App;
