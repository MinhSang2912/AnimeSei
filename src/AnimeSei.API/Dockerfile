FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["src/AnimeSei.API/AnimeSei.API.csproj", "src/AnimeSei.API/"]
COPY ["src/AnimeSei.Infrastructure/AnimeSei.Infrastructure.csproj", "src/AnimeSei.Infrastructure/"]
COPY ["src/AnimeSei.Application/AnimeSei.Application.csproj", "src/AnimeSei.Application/"]
COPY ["src/AnimeSei.Domain/AnimeSei.Domain.csproj", "src/AnimeSei.Domain/"]
RUN dotnet restore "src/AnimeSei.API/AnimeSei.API.csproj"

COPY . .
WORKDIR "/src/src/AnimeSei.API"
RUN dotnet build "AnimeSei.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AnimeSei.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AnimeSei.API.dll"]
