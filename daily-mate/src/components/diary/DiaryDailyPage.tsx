import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { diaryByDateResponse, diaryDailyParams } from "../../types/diaryType";
import {
  deleteDiary,
  getDiaryByDate,
  getOtherDiaryByDate,
  likeDiary,
} from "../../apis/diaryApi";
import DiaryComment from "./DiaryComment";
import { useRecoilValue } from "recoil";
import { userInfoState } from "../../atoms/authAtom";
import { LuTrash2 } from "react-icons/lu";
import styled from "styled-components";
import { formatDate } from "../common/FormatDate";
import { FullHeart, OutLineHeart } from "../common/CommonStyledComponents";

const DiaryDailyPage = () => {
  const { id, date } = useParams<diaryDailyParams>();
  const [isMyDiary, setIsMyDiary] = useState<boolean>(false);
  const userInfo = useRecoilValue(userInfoState);
  const [diaryDetail, setDiaryDetail] = useState<diaryByDateResponse>({
    diaryId: -1,
    title: "",
    content: "",
    date: "",
    image: "",
    weather: "",
    feeling: "",
    openType: "",
    createdAt: "0000-00-00",
    updatedAt: "0000-00-00",
    likeNum: 0,
    isLike: false,
  });
  const deleteDiaryNow = () => {
    deleteDiary(diaryDetail.diaryId);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (date !== undefined && id !== undefined) {
        const isMyDiary: boolean = parseInt(id) === userInfo.userId;
        const diaryByDateData: diaryByDateResponse | null = isMyDiary
          ? await getDiaryByDate(date)
          : await getOtherDiaryByDate(date, userInfo.userId);
        if (diaryByDateData !== null) {
          setDiaryDetail(diaryByDateData);
        } else {
          setDiaryDetail({
            diaryId: 100,
            title: titleExample,
            content: contentExample,
            date: "날짜",
            image: "이미지",
            weather: "맑음",
            feeling: "행복",
            openType: "공개",
            createdAt: "0000-00-00",
            updatedAt: "0000-00-00",
            likeNum: 3,
            isLike: false,
          });
        }
        setIsMyDiary(isMyDiary);
      }
    };
    fetchData();
  }, [date, id, userInfo.userId]);

  // 수정할 수 있다면 수정하기
  const handleLikeDiary = async (diaryId: number) => {
    if (likeDiary(diaryId) !== null) {
      if (date !== undefined && id !== undefined) {
        const isMyDiary: boolean = parseInt(id) === userInfo.userId;
        const diaryByDateData: diaryByDateResponse | null = isMyDiary
          ? await getDiaryByDate(date)
          : await getOtherDiaryByDate(date, userInfo.userId);
        if (diaryByDateData !== null) {
          setDiaryDetail(diaryByDateData);
        }
      }
    }
  };

  const weatherIcon = (weather: string) => {
    let weatherNow = "";
    switch (weather) {
      case "맑음":
        weatherNow = "sunny";
        break;
      case "흐림":
        weatherNow = "cloudy";
        break;
      case "비":
        weatherNow = "rainy";
        break;
      case "눈":
        weatherNow = "snow";
        break;
      default:
        break;
    }
    const weatherSrc: string =
      process.env.PUBLIC_URL + `/free-icon-${weatherNow}.png`;
    return <ImageBox src={weatherSrc} alt="default" />;
  };

  return (
    <DiaryDailyWrapper>
      <DiaryContainer>
        <DateBox>
          <div>{formatDate(date)}</div>
        </DateBox>
        <TitleBox>
          <div>{diaryDetail.title}</div>
        </TitleBox>
        <DiaryTop>
          <FeelingBox>
            <div>오늘의 기분</div>
            <div style={{ margin: "0 0.5rem" }}></div>
            <div>{diaryDetail.feeling}</div>
          </FeelingBox>
          <WeatherBox>
            <div>오늘의 날씨</div>
            <div style={{ margin: "0 0.5rem" }}></div>
            <div>{weatherIcon(diaryDetail.weather)}</div>
          </WeatherBox>
        </DiaryTop>
        <DiaryBottom>
          {diaryDetail.image && (
            <ContentImageContainer>
              <ContentImageBox
                src={`https://dailymate.s3.ap-northeast-2.amazonaws.com/${diaryDetail.image}`}
                alt="example"
              />
            </ContentImageContainer>
          )}
          <ContentBox>
            <ContentInside>{diaryDetail.content}</ContentInside>
          </ContentBox>
          <DiaryIconBox>
            {isMyDiary ? (
              <TrashCan onClick={deleteDiaryNow} />
            ) : (
              <div style={{ opacity: "0" }}>숨김</div>
            )}
            {diaryDetail.isLike ? (
              <FullHeart onClick={() => handleLikeDiary(diaryDetail.diaryId)} />
            ) : (
              <OutLineHeart
                onClick={() => handleLikeDiary(diaryDetail.diaryId)}
              />
            )}
          </DiaryIconBox>
        </DiaryBottom>
      </DiaryContainer>
      <CommentContainer>
        <DiaryComment diaryId={diaryDetail.diaryId} />
      </CommentContainer>
    </DiaryDailyWrapper>
  );
};

export default DiaryDailyPage;

const DiaryDailyWrapper = styled.div`
  width: auto;
  display: flex;
  font-family: "LeeSeoyun";
  font-size: 1.4rem;

  @media screen and (min-width: 992px) {
    flex-direction: row;
  }

  @media screen and (max-width: 991px) {
    flex-direction: column;
  }
`;

const DiaryContainer = styled.div`
  padding: 1rem;
  @media screen and (min-width: 992px) {
    flex: 2 1 0;
  }
`;

const CommentContainer = styled.div`
  padding: 1rem;
  @media screen and (min-width: 992px) {
    flex: 1 1 0;
  }
`;

const DateBox = styled.div`
  display: flex;
  justify-content: center;
`;

const TitleBox = styled.div`
  display: flex;
  justify-content: center;
  font-weight: bold;
  font-size: 1.6em;
  margin: 1rem 0;
`;

const ImageBox = styled.img`
  // border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  object-fit: cover;
`;

const DiaryTop = styled.div`
  display: flex;
`;

const DiaryBottom = styled.div`
  padding: 1rem;
`;

const FeelingBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WeatherBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentImageContainer = styled.div`
  display: inline-block;
`;

const ContentImageBox = styled.img`
  width: 100%;
  height: auto;
`;

const ContentBox = styled.div`
  display: flex;
  font-size: 1.4em;
`;

const ContentInside = styled.p`
  line-height: 125%;
  margin: 1rem 0;
`;

const TrashCan = styled(LuTrash2)`
  cursor: pointer;
  &:hover {
    color: #9b9b9b;
  }
`;

const DiaryIconBox = styled.div`
  display: flex;
  justify-content: space-between;
`;

const titleExample: string = "아주 희미한 빛으로도 : 최은영";

const contentExample: string =
  "그녀의 수업은 금요일 오후 세시 삼십분에 시작했다. 짧은 커트 머리에 갈색 뿔테안경을 쓴 그녀의 얼굴은 얼핏 보면 강사로 여겨지지 않을 정도로 어려 보였다. 목소리는 낮고 허스키한 편이었다. 영문과 전공수업은 전부 영어 강의여서 그녀는 영어로 수업을 소개했다.";
