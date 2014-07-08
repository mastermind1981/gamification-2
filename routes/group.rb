class Gamification < Sinatra::Application

  # Get all groups
  #
  # return [Array] group objects
  get '/group' do
    if authorized?
      content_type :json
      @group = Group.all()
      status 200
      return @group.to_json
    else
      status 401
    end
  end

  # Get a group by id
  #
  # param [String] the group id
  #
  # return [Object] group
  get '/group/:id' do
    if authorized?
      content_type :json
      group = Group.find(params[:id])
      status 200
      return group.to_json
    else
      status 401
    end
  end

  # Get groups for a classroom by id
  #
  # param [String] the classroom id
  #
  # return [Object] classroom
  get '/group/classroom/:id' do
    if authorized?
      content_type :json
      group = Group.where(:classroom_id => params[:id])
      status 200
      return group.to_json
    else
      status 401
    end
  end

  # Create a new group
  #
  # return [Object] group
  post '/group' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      group = Group.create()
      status 200
      return  group.to_json
    else
      status 401
    end
  end

  # Update a group by id
  #
  # param [String] the group id
  #
  # body [Object] in JSON. ex: {"label":"<String>", "avatar_url":"<String>", "blog_url":"<String>", "score":"<Integer>" }
  #
  # return [Object] group
  put '/group/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      group = Group.find(params[:id])

      if group then
        data = JSON.parse request.body.read

        unless data['label'].nil?
          group.update_attributes(:label => data['label'])
          group.save
        end

        unless data['avatarUrl'].nil?
          group.update_attributes(:avatarUrl => data['avatarUrl'])
          group.save
        end

        unless data['blogUrl'].nil?
          group.update_attributes(:blogUrl => data['blogUrl'])
          group.save
        end

        unless data['score'].nil?
          group.update_attributes(:score => data['score'])
          group.save
        end

        status 200

        return  group.to_json
      else
        return {"error" => "Group "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a student to a group by id
  #
  # param [String] the group id
  #
  # param [String] the student id
  #
  # return [Object] group
  put '/group/:id/addstudent/:studentid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      group = Group.find(params[:id])

      if group then

        begin
          student = Student.find(params[:studentid])
        end

        if student and group.classroom_id == student.classroom_id then
          group.students << student
        else
          status 500
          return {"error" => "Student "+params[:studentid]+" not found"}.to_json
        end

        status 200

        return  group.to_json
      else
        return {"error" => "Group "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Remove a student from a group by id
  #
  # param [String] the group id
  #
  # param [String] the student id
  #
  # return [Object] group
  put '/group/:id/removestudent/:studentid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      group = Group.find(params[:id])

      if group then

        begin
          student = Student.find(params[:studentid])
        end

        if student
          group.students.delete(student)
        else
          status 500
          return {"error" => "Student "+data['student_id']+" not found"}.to_json
        end

        status 200

        return  group.to_json
      else
        return {"error" => "Group "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end

  # Add a badge to a group by id
  #
  # param [String] the group id
  #
  # param [String] the badge id
  #
  # return [Object] group
  put '/group/:id/addbadge/:badgeid' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      group = Group.find(params[:id])

      if group then

        begin
          badge = Badge.find(params[:badgeid])
        end

        if badge then
          data = JSON.parse request.body.read
          puts (group.badges.length).to_s;

          lastcount = 0;

          group.badges.each do |bad|
            if bad['origin']['_id'].to_s == params[:badgeid] then
              lastcount = bad['count'].to_i;
              group.badges.delete(bad);
              group.save!
              sleep 2;
              break;
            end
          end

          group.push(:badges, {"count" => lastcount+1, "deliverytype" => data['deliverytype'], "origin" => {"_id" => badge._id, "avatar" => badge.avatar, "time" => badge.time, "label" => badge.label, "description" => badge.description }});
          #group.badges.push({"count" => lastcount+1, "deliverytype" => data['deliverytype'], "origin" => {"_id" => badge._id, "avatar" => badge.avatar, "time" => badge.time, "label" => badge.label, "description" => badge.description }});
          group.save!
          sleep 2;

          puts (group.badges.length).to_s;
        else
          status 500
          return {"error" => "Badge "+params[:badgeid]+" not found"}.to_json
        end

        status 200

        return  group.to_json
      else
        return {"error" => "Group "+params[:id]+" not found"}.to_json
      end
    else
      status 401
    end
  end


  # Delete a group by id
  #
  # param [String] the group id
  #
  # return [Object] message
  delete '/group/:id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      group = Group.find(params[:id])

      if group.students.empty? then
        if group.destroy then
          status 200
          return {"message" => "Group "+params[:id]+" deleted"}.to_json
        else
          status 500
          return {"error" => "Group "+params[:id]+" not deleted"}.to_json
        end
      else
        status 401
        return {"error" => "This group has students. Delete those first before deleting this group."}.to_json
      end
    else
      status 401
      return {"error" => "Not authorised"}.to_json
    end
  end
end
